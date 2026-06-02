package co.edu.unicauca.microreportes.config;

import org.springframework.context.annotation.Configuration;

/**
 * CORS es responsabilidad exclusiva del API Gateway (SecurityConfiguration).
 * Este microservicio solo es accesible desde el gateway, por lo que no
 * necesita su propia configuración CORS — hacerlo duplica el header
 * Access-Control-Allow-Origin y el navegador rechaza la respuesta.
 */
@Configuration
public class CorsConfig {
    // Intencionalmenте vacío: el gateway gestiona CORS
}
