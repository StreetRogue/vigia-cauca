package co.edu.unicauca.microreportes.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de RabbitMQ para el microservicio de reportes.
 *
 * Topología propuesta:
 *   Exchange (fanout): exchange.novedades
 *     ├── cola.novedades.notificaciones  (consumer: micro-notificaciones)
 *     └── cola.novedades.estadisticas    (consumer: micro-reportes) ← ESTA
 *
 * Cambio necesario en micro-novedades:
 *   Publicar a exchange en vez de directamente a cola.
 *   rabbitTemplate.convertAndSend("exchange.novedades", "", evento);
 *
 * Si no se cambia novedades, este micro puede escuchar la misma cola
 * (cola.novedades.notificaciones) como consumer adicional.
 */
@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.queue.novedades}")
    private String nombreCola;

    @Value("${rabbitmq.exchange.novedades:exchange.novedades}")
    private String exchangeName;

    @Value("${rabbitmq.routing-key.novedades:rk.novedades.estadisticas}")
    private String routingKey;

    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory connectionFactory) {
        return new RabbitAdmin(connectionFactory);
    }

    @Bean
    public Queue colaEstadisticas() {
        return QueueBuilder.durable(nombreCola)
                .withArgument("x-dead-letter-exchange", "dlx.novedades")
                .withArgument("x-dead-letter-routing-key", "dlq.novedades.estadisticas")
                .build();
    }

    @Bean
    public FanoutExchange exchangeNovedades() {
        return new FanoutExchange(exchangeName, true, false);
    }

    @Bean
    public Binding binding() {
        return BindingBuilder.bind(colaEstadisticas()).to(exchangeNovedades());
    }

    // Dead Letter Queue para mensajes que fallan después de todos los reintentos
    @Bean
    public Queue dlqEstadisticas() {
        return QueueBuilder.durable("dlq.novedades.estadisticas").build();
    }

    @Bean
    public DirectExchange dlxNovedades() {
        return new DirectExchange("dlx.novedades", true, false);
    }

    @Bean
    public Binding dlqBinding() {
        return BindingBuilder.bind(dlqEstadisticas())
                .to(dlxNovedades())
                .with("dlq.novedades.estadisticas");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public CommandLineRunner inicializarRabbit(RabbitAdmin rabbitAdmin) {
        return args -> rabbitAdmin.initialize();
    }
}
