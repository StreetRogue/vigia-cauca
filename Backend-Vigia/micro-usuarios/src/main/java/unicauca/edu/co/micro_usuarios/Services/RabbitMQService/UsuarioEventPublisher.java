package unicauca.edu.co.micro_usuarios.Services.RabbitMQService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import unicauca.edu.co.micro_usuarios.Config.RabbitMQ.RabbitConfig;
import unicauca.edu.co.micro_usuarios.DTOs.Response.UsuarioResponseDTO;
import unicauca.edu.co.micro_usuarios.Mapper.UsuarioMapper;
import unicauca.edu.co.micro_usuarios.Services.RabbitMQService.Models.TipoEventoUsuario;
import unicauca.edu.co.micro_usuarios.Services.RabbitMQService.Models.UsuarioEvent;
import unicauca.edu.co.micro_usuarios.Services.RabbitMQService.Models.UsuarioPayload;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class UsuarioEventPublisher {
    private final RabbitTemplate rabbitTemplate;

    public void publicarCreacion(UsuarioResponseDTO usuario) {
        publicar(RabbitConfig.RK_USER_CREATED, TipoEventoUsuario.CREATED, usuario);
    }

    public void publicarActualizacion(UsuarioResponseDTO usuario) {
        publicar(RabbitConfig.RK_USER_UPDATED, TipoEventoUsuario.UPDATED, usuario);
    }

    private void publicar(String routingKey, TipoEventoUsuario tipoEvento, UsuarioResponseDTO usuario) {
        try {
            UsuarioEvent<UsuarioPayload> event = new UsuarioEvent<>();

            event.setEventType(tipoEvento.name());
            event.setEventVersion("v1");
            event.setEventDate(LocalDateTime.now());

            UsuarioPayload payload = UsuarioMapper.toEvent(usuario);
            event.setData(payload);

            rabbitTemplate.convertAndSend(
                    RabbitConfig.EXCHANGE,
                    routingKey,
                    event
            );;

            log.info(
                    "Evento enviado a RabbitMQ | exchange={} | routingKey={} | tipo={} | usuarioId={}",
                    RabbitConfig.EXCHANGE,
                    routingKey,
                    tipoEvento,
                    usuario.getIdUsuario()
            );
        } catch (Exception e) {
            log.error(
                    "Error enviando evento a RabbitMQ | exchange={} | routingKey={} | tipo={} | usuarioId={}",
                    RabbitConfig.EXCHANGE,
                    routingKey,
                    tipoEvento,
                    usuario.getIdUsuario(),
                    e
            );
        }
    }
}
