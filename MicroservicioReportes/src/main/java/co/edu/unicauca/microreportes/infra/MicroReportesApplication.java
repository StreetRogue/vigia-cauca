package co.edu.unicauca.microreportes.infra;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = "co.edu.unicauca")
@EntityScan(basePackages = "co.edu.unicauca")
@EnableJpaRepositories(basePackages = "co.edu.unicauca")
public class MicroReportesApplication {
    public static void main(String[] args) {
        SpringApplication.run(MicroReportesApplication.class, args);
    }
}