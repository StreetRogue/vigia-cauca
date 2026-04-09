package co.edu.unicauca.microreportes.capaControladores;

import co.edu.unicauca.microreportes.fachadaServices.services.SseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

/**
 * Endpoint SSE para notificaciones en tiempo real.
 *
 * Uso en el frontend (JavaScript):
 *
 *   const evtSource = new EventSource('/api/v1/reportes/sse/stream?canal=dashboard');
 *
 *   evtSource.addEventListener('novedad-actualizada', (event) => {
 *       const data = JSON.parse(event.data);
 *       console.log('Dashboard actualizado:', data);
 *       // Refrescar KPIs y gráficos
 *       recargarDashboard();
 *   });
 *
 *   // Para filtrar por municipio:
 *   const evtSource2 = new EventSource('/api/v1/reportes/sse/stream?canal=dashboard:Popayan');
 *
 * Integración API Gateway:
 * - El Gateway debe rutear /api/v1/reportes/** → micro-reportes:5004
 * - Headers requeridos: Connection: keep-alive, Cache-Control: no-cache
 * - Timeout del proxy >= 5 minutos
 */
@RestController
@RequestMapping("/api/v1/reportes/sse")
@RequiredArgsConstructor
public class SseController {

    private final SseService sseService;

    /**
     * GET /api/v1/reportes/sse/stream?canal=dashboard
     * Abre conexión SSE. El navegador reconecta automáticamente si se cae.
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(
            @RequestParam(defaultValue = "dashboard") String canal
    ) {
        return sseService.suscribir(canal);
    }

    /**
     * GET /api/v1/reportes/sse/status
     * Health check del servicio SSE.
     */
    @GetMapping("/status")
    public Map<String, Object> status() {
        return Map.of(
                "conexionesActivas", sseService.conexionesActivas(),
                "status", "OK"
        );
    }
}
