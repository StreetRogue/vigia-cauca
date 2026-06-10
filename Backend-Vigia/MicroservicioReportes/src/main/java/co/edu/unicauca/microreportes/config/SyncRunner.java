package co.edu.unicauca.microreportes.config;

import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.EstadisticaAgregadaRepository;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.EventoProcesadoRepository;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.NovedadSnapshotRepository;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.VictimaSnapshotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class SyncRunner implements ApplicationRunner {

    private final NovedadSnapshotRepository snapshotRepository;
    private final EstadisticaAgregadaRepository agregadaRepository;
    private final EventoProcesadoRepository eventoProcesadoRepository;
    private final VictimaSnapshotRepository victimaSnapshotRepository;

    @Value("${clients.novedades.base-url}")
    private String novedadesBaseUrl;

    private static final int MAX_RETRIES = 5;
    private static final long RETRY_DELAY_MS = 5000;

    @Override
    public void run(ApplicationArguments args) {
        try {
            long countReal = obtenerCountNovedades();
            long countLocal = snapshotRepository.count();

            log.info("[Sync] Novedades activas: {}, snapshots locales: {}", countReal, countLocal);

            if (countReal == countLocal) {
                log.info("[Sync] Bases de datos sincronizadas, sin acción necesaria.");
                return;
            }

            log.warn("[Sync] Desincronización detectada (novedades={}, snapshots={}). Limpiando caché y disparando resync...",
                    countReal, countLocal);

            limpiarTablas();

            if (countReal > 0) {
                dispararResync();
            }

            log.info("[Sync] Resincronización completada.");
        } catch (Exception e) {
            log.warn("[Sync] No se pudo sincronizar al arrancar (no crítico): {}", e.getMessage());
        }
    }

    private long obtenerCountNovedades() throws InterruptedException {
        RestTemplate restTemplate = new RestTemplate();
        String url = novedadesBaseUrl + "/api/v1/microNovedades/public/sync/count";

        for (int intento = 1; intento <= MAX_RETRIES; intento++) {
            try {
                ResponseEntity<Map<String, Long>> response = restTemplate.exchange(
                        url, HttpMethod.GET, null,
                        new ParameterizedTypeReference<>() {}
                );
                Map<String, Long> body = response.getBody();
                return body != null ? body.getOrDefault("count", 0L) : 0L;
            } catch (Exception e) {
                if (intento < MAX_RETRIES) {
                    log.info("[Sync] micro-novedades no disponible, reintento {}/{}...", intento, MAX_RETRIES);
                    Thread.sleep(RETRY_DELAY_MS);
                } else {
                    throw e;
                }
            }
        }
        return 0L;
    }

    @Transactional
    public void limpiarTablas() {
        victimaSnapshotRepository.deleteAllInBatch();
        snapshotRepository.deleteAllInBatch();
        agregadaRepository.deleteAllInBatch();
        eventoProcesadoRepository.deleteAllInBatch();
        log.info("[Sync] Tablas de caché limpiadas.");
    }

    private void dispararResync() {
        RestTemplate restTemplate = new RestTemplate();
        String url = novedadesBaseUrl + "/api/v1/microNovedades/public/sync/resync";
        try {
            restTemplate.postForEntity(url, null, String.class);
        } catch (Exception e) {
            log.warn("[Sync] Error disparando resync: {}", e.getMessage());
        }
    }
}
