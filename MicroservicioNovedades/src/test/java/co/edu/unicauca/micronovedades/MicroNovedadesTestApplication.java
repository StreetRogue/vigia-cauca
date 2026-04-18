package co.edu.unicauca.micronovedades;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;

/**
 * Clase de configuración usada por @WebMvcTest para encontrar el contexto de Spring Boot
 * en los tests. Excluye las auto-configuraciones de RabbitMQ y base de datos para
 * que los tests funcionen sin infraestructura externa.
 */
@SpringBootApplication(
        exclude = {
                RabbitAutoConfiguration.class,
                DataSourceAutoConfiguration.class,
                HibernateJpaAutoConfiguration.class
        },
        scanBasePackages = "co.edu.unicauca.micronovedades"
)
public class MicroNovedadesTestApplication {
}
