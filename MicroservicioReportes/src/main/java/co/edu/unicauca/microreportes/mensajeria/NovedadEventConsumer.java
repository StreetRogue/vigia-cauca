package co.edu.unicauca.microreportes.mensajeria;

import co.edu.unicauca.microreportes.fachadaServices.services.IProyeccionService;
import co.edu.unicauca.microreportes.fachadaServices.services.SseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.Channel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Consumer de eventos de novedades desde RabbitMQ.
 *
 * Flujo completo:
 * 1. micro-novedades publica evento en cola
 * 2. Este consumer lo recibe
 * 3. Delega al ProyeccionService (actualiza read model + stats)
 * 4. Notifica al frontend via SSE
 * 5. ACK manual del mensaje
 *
 * ACK manual: si el procesamiento falla, el mensaje vuelve a la cola (retry).
 * Idempotencia: ProyeccionService verifica duplicados internamente.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NovedadEventConsumer {

    private final IProyeccionService proyeccionService;
    private final SseService sseService;
    private final ObjectMapper objectMapper;

    @RabbitListener(queues = "${rabbitmq.queue.novedades}")
    public void consumirEvento(Message message, Channel channel) {
        long deliveryTag = message.getMessageProperties().getDeliveryTag();

        try {
            // Deserializar evento
            NovedadEventoDTO evento = objectMapper.readValue(
                    message.getBody(), NovedadEventoDTO.class);

            log.info("Evento recibido: tipo={}, novedadId={}, municipio={}",
                    evento.getTipo(), evento.getNovedadId(), evento.getMunicipio());

            // Procesar según tipo
            switch (evento.getTipo()) {
                case "NOVEDAD_CREADA" -> proyeccionService.procesarNovedadCreada(evento);
                case "NOVEDAD_ACTUALIZADA" -> proyeccionService.procesarNovedadActualizada(evento);
                case "NOVEDAD_ELIMINADA" -> proyeccionService.procesarNovedadEliminada(evento);
                default -> log.warn("Tipo de evento desconocido: {}", evento.getTipo());
            }

            // Notificar frontend via SSE
            notificarFrontend(evento);

            // ACK exitoso
            channel.basicAck(deliveryTag, false);
            log.debug("Evento procesado y ACK: {}", evento.getNovedadId());

        } catch (Exception e) {
            log.error("Error procesando evento: {}", e.getMessage(), e);
            try {
                // NACK con requeue=true para reintentar
                // El retry de RabbitMQ (configurado en application.yml) manejará los reintentos
                channel.basicNack(deliveryTag, false, true);
            } catch (Exception nackEx) {
                log.error("Error enviando NACK: {}", nackEx.getMessage());
            }
        }
    }

    /**
     * Notifica a los clientes SSE conectados sobre el cambio.
     * Emite tanto al canal general como al canal específico del municipio.
     */
    private void notificarFrontend(NovedadEventoDTO evento) {
        try {
            Map<String, Object> payload = Map.of(
                    "tipo", evento.getTipo(),
                    "novedadId", evento.getNovedadId(),
                    "municipio", evento.getMunicipio(),
                    "categoria", evento.getCategoria(),
                    "timestamp", evento.getTimestamp()
            );

            // Canal general: todos los dashboards
            sseService.emitir("dashboard", "novedad-actualizada", payload);

            // Canal específico por municipio
            sseService.emitir("dashboard:" + evento.getMunicipio(),
                    "novedad-actualizada", payload);

        } catch (Exception e) {
            log.warn("Error notificando SSE (no crítico): {}", e.getMessage());
        }
    }
}
