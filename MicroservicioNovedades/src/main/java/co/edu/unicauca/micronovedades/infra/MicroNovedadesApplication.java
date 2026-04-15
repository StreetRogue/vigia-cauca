package co.edu.unicauca.micronovedades.infra;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "co.edu.unicauca.micronovedades")
@EntityScan(basePackages = "co.edu.unicauca.micronovedades.capaAccesoDatos.models")
@EnableJpaRepositories(basePackages = "co.edu.unicauca.micronovedades.capaAccesoDatos.repositories")
public class MicroNovedadesApplication {

    public static void main(String[] args) {
        SpringApplication.run(MicroNovedadesApplication.class, args);
    }
}
