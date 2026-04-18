package co.edu.unicauca.microreportes.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Caché en memoria con Caffeine.
 *
 * Estrategia:
 * - TTL de 60s: los datos se refrescan cada minuto como máximo.
 * - Invalidación activa: al procesar un evento, se limpia el caché.
 * - Máximo 500 entradas: suficiente para ~42 municipios × ~12 meses × filtros.
 *
 * Para escalar a múltiples instancias: migrar a Redis.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager(
                "kpis", "serieTemporal", "mapaCalor", "dashboard", "victimasEstadisticas"
        );
        manager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(500)
                .expireAfterWrite(60, TimeUnit.SECONDS)
                .recordStats()
        );
        return manager;
    }
}
