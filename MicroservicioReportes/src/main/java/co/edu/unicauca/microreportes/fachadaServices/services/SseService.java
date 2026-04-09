package co.edu.unicauca.microreportes.fachadaServices.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Servicio de Server-Sent Events (SSE) para notificaciones en tiempo real.
 *
 * ¿Por qué SSE y no WebSocket?
 * 1. Unidireccional (server→client): suficiente para notificar cambios en stats
 * 2. Funciona sobre HTTP/1.1: pasa por API Gateway sin config extra
 * 3. Reconexión automática nativa del navegador
 * 4. Menor complejidad que WebSocket para este caso de uso
 *
 * Integración con API Gateway:
 * - El Gateway debe pasar el header Connection: keep-alive
 * - Timeout del Gateway debe ser >= sse.timeout-ms (5 min)
 * - Si el Gateway usa Spring Cloud Gateway, agregar filtro:
 *     filters:
 *       - DedupeResponseHeader=Access-Control-Allow-Origin
 */
@Service
@Slf4j
public class SseService {

    // Emitters agrupados por "canal" (ej: "dashboard", "dashboard:Popayan")
    private final Map<String, CopyOnWriteArrayList<SseEmitter>> canales = new ConcurrentHashMap<>();

    private static final long SSE_TIMEOUT = 300_000L; // 5 minutos

    /**
     * Registra un nuevo cliente SSE.
     * El frontend se conecta a: GET /api/v1/reportes/sse/stream?canal=dashboard
     */
    public SseEmitter suscribir(String canal) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);
        canales.computeIfAbsent(canal, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> remover(canal, emitter));
        emitter.onTimeout(() -> remover(canal, emitter));
        emitter.onError(e -> remover(canal, emitter));

        log.debug("SSE: cliente conectado al canal '{}'", canal);
        return emitter;
    }

    /**
     * Envía un evento a todos los clientes suscritos a un canal.
     * Llamado por el consumer de RabbitMQ tras procesar un evento.
     */
    public void emitir(String canal, String eventoNombre, Object data) {
        CopyOnWriteArrayList<SseEmitter> emitters = canales.get(canal);
        if (emitters == null || emitters.isEmpty()) return;

        SseEmitter.SseEventBuilder event = SseEmitter.event()
                .name(eventoNombre)
                .data(data);

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(event);
            } catch (IOException e) {
                remover(canal, emitter);
            }
        }
        log.debug("SSE: evento '{}' emitido al canal '{}' ({} clientes)",
                eventoNombre, canal, emitters.size());
    }

    /**
     * Emite a todos los canales que coincidan con un prefijo.
     * Útil para notificar tanto "dashboard" como "dashboard:Popayan".
     */
    public void emitirATodos(String eventoNombre, Object data) {
        canales.keySet().forEach(canal -> emitir(canal, eventoNombre, data));
    }

    private void remover(String canal, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> emitters = canales.get(canal);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) canales.remove(canal);
        }
    }

    /**
     * Retorna el número total de conexiones activas.
     */
    public int conexionesActivas() {
        return canales.values().stream().mapToInt(CopyOnWriteArrayList::size).sum();
    }
}
