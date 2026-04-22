package co.edu.unicauca.microreportes.config;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.EstadisticaAgregadaEntity;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.NovedadSnapshotEntity;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.VictimaSnapshotEntity;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.*;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.EstadisticaAgregadaRepository;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.NovedadSnapshotRepository;
import co.edu.unicauca.microreportes.capaAccesoDatos.repositories.VictimaSnapshotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

/**
 * Siembra datos de prueba al arrancar la aplicación.
 * Solo corre cuando la tabla novedad_snapshot está vacía.
 * No se activa en el perfil "test" para no interferir con pruebas unitarias.
 */
@Component
@Profile("!test")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final NovedadSnapshotRepository snapshotRepository;
    private final EstadisticaAgregadaRepository agregadaRepository;
    private final VictimaSnapshotRepository victimaSnapshotRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void sembrarDatos() {
        boolean haySnapshots = snapshotRepository.count() > 0;
        boolean hayVictimas  = victimaSnapshotRepository.count() > 0;

        if (haySnapshots && hayVictimas) {
            log.info("[DataSeeder] Datos ya existen, omitiendo siembra.");
            return;
        }

        if (!haySnapshots) {
            log.info("[DataSeeder] Sembrando snapshots, agregados y víctimas...");
            List<NovedadSnapshotEntity> snapshots = construirSnapshots();
            List<NovedadSnapshotEntity> guardados = snapshotRepository.saveAll(snapshots);
            construirAgregados(guardados);
            List<VictimaSnapshotEntity> victimas = construirVictimas(guardados);
            victimaSnapshotRepository.saveAll(victimas);
            log.info("[DataSeeder] Sembrados {} snapshots y {} víctimas.", guardados.size(), victimas.size());
        } else {
            // Snapshots ya existen pero víctimas están vacías → sembrar solo víctimas
            log.info("[DataSeeder] Snapshots ya existen, sembrando solo víctimas...");
            List<NovedadSnapshotEntity> existentes = snapshotRepository.findAll();
            List<VictimaSnapshotEntity> victimas = construirVictimas(existentes);
            victimaSnapshotRepository.saveAll(victimas);
            log.info("[DataSeeder] Sembradas {} víctimas desde {} snapshots existentes.", victimas.size(), existentes.size());
        }
    }

    // =========================================================
    // SNAPSHOTS
    // Cada fila representa un evento real-ish del departamento.
    // Columnas: anio, mes, municipio, cat, actor1, actor2,
    //           visib, muertos, muertosCiv, muertosFP,
    //           heridos, heridosCiv, desplazados, confinados
    // =========================================================
    private List<NovedadSnapshotEntity> construirSnapshots() {
        List<Object[]> filas = new ArrayList<>();

        // ─── TORIBÍO – zona de disputa ELN / Segunda Marquetalia ──────────────
        filas.add(e(2024,  1,"Toribío", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  3,1,2, 5,4,  0,  0));
        filas.add(e(2024,  2,"Toribío", CategoriaEvento.HOSTIGAMIENTO,     Actor.SEGUNDA_MARQUETALIA,Actor.NO_IDENTIFICADO,  NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));
        filas.add(e(2024,  3,"Toribío", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  2,0,2, 3,2,  0,  0));
        filas.add(e(2024,  3,"Toribío", CategoriaEvento.RECLUTAMIENTO_ILICITO,Actor.ELN,            null,                   NivelVisibilidad.PRIVADA,  0,0,0, 0,0,  0,  0));
        filas.add(e(2024,  5,"Toribío", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  4,1,3, 6,4, 80,  0));
        filas.add(e(2024,  6,"Toribío", CategoriaEvento.ATENTADO_TERRORISTA,Actor.ELN,              null,                   NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));
        filas.add(e(2024,  7,"Toribío", CategoriaEvento.HOSTIGAMIENTO,     Actor.SEGUNDA_MARQUETALIA,Actor.FUERZA_PUBLICA,  NivelVisibilidad.PUBLICA,  1,1,0, 3,3,  0,  0));
        filas.add(e(2024,  7,"Toribío", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  5,2,3, 8,5,200,  0));
        filas.add(e(2024,  8,"Toribío", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  2,0,2, 4,3,  0,  0));
        filas.add(e(2024,  9,"Toribío", CategoriaEvento.HOSTIGAMIENTO,     Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 1,1,  0,  0));
        filas.add(e(2024, 10,"Toribío", CategoriaEvento.ENFRENTAMIENTO,    Actor.SEGUNDA_MARQUETALIA,Actor.FUERZA_PUBLICA,  NivelVisibilidad.PUBLICA,  3,1,2, 5,3,120,  0));
        filas.add(e(2024, 11,"Toribío", CategoriaEvento.ATENTADO_TERRORISTA,Actor.ELN,              null,                   NivelVisibilidad.PUBLICA,  0,0,0, 3,3,  0,  0));
        filas.add(e(2024, 12,"Toribío", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  2,0,2, 2,1,  0,  0));

        filas.add(e(2025,  1,"Toribío", CategoriaEvento.HOSTIGAMIENTO,     Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));
        filas.add(e(2025,  2,"Toribío", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  3,1,2, 4,3,  0,  0));
        filas.add(e(2025,  3,"Toribío", CategoriaEvento.ENFRENTAMIENTO,    Actor.SEGUNDA_MARQUETALIA,Actor.FUERZA_PUBLICA,  NivelVisibilidad.PUBLICA,  4,2,2, 7,5,250,  0));
        filas.add(e(2025,  4,"Toribío", CategoriaEvento.ATENTADO_TERRORISTA,Actor.ELN,              null,                   NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));
        filas.add(e(2025,  5,"Toribío", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  5,2,3, 9,6,300,  0));
        filas.add(e(2025,  5,"Toribío", CategoriaEvento.RECLUTAMIENTO_ILICITO,Actor.ELN,            null,                   NivelVisibilidad.PRIVADA,  0,0,0, 0,0,  0,  0));
        filas.add(e(2025,  6,"Toribío", CategoriaEvento.HOSTIGAMIENTO,     Actor.SEGUNDA_MARQUETALIA,Actor.FUERZA_PUBLICA,  NivelVisibilidad.PUBLICA,  1,1,0, 3,3,  0,  0));
        filas.add(e(2025,  7,"Toribío", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  6,2,4,10,7,400,  0));
        filas.add(e(2025,  8,"Toribío", CategoriaEvento.ATENTADO_TERRORISTA,Actor.ELN,              null,                   NivelVisibilidad.PUBLICA,  0,0,0, 4,4,  0,  0));
        filas.add(e(2025,  9,"Toribío", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  2,0,2, 3,2,  0,  0));
        filas.add(e(2025, 10,"Toribío", CategoriaEvento.HOSTIGAMIENTO,     Actor.SEGUNDA_MARQUETALIA,null,                  NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));
        filas.add(e(2025, 11,"Toribío", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  3,1,2, 5,4,150,  0));
        filas.add(e(2025, 12,"Toribío", CategoriaEvento.ENFRENTAMIENTO,    Actor.SEGUNDA_MARQUETALIA,Actor.FUERZA_PUBLICA,  NivelVisibilidad.PUBLICA,  2,0,2, 4,3,  0,  0));

        filas.add(e(2026,  1,"Toribío", CategoriaEvento.HOSTIGAMIENTO,     Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 1,1,  0,  0));
        filas.add(e(2026,  2,"Toribío", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  2,1,1, 3,2,  0,  0));
        filas.add(e(2026,  3,"Toribío", CategoriaEvento.ENFRENTAMIENTO,    Actor.SEGUNDA_MARQUETALIA,Actor.FUERZA_PUBLICA,  NivelVisibilidad.PUBLICA,  3,1,2, 5,4,100,  0));
        filas.add(e(2026,  4,"Toribío", CategoriaEvento.ATENTADO_TERRORISTA,Actor.ELN,              null,                   NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));

        // ─── SANTANDER DE QUILICHAO – conflicto urbano / sicariato ────────────
        filas.add(e(2024,  1,"Santander de Quilichao", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,              NivelVisibilidad.PUBLICA,  2,2,0, 0,0,  0,  0));
        filas.add(e(2024,  2,"Santander de Quilichao", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,              NivelVisibilidad.PUBLICA,  3,3,0, 1,1,  0,  0));
        filas.add(e(2024,  3,"Santander de Quilichao", CategoriaEvento.RECLUTAMIENTO_ILICITO,Actor.ELN,           null,              NivelVisibilidad.PRIVADA,  0,0,0, 0,0,  0,  0));
        filas.add(e(2024,  4,"Santander de Quilichao", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,              NivelVisibilidad.PUBLICA,  1,1,0, 0,0,  0,  0));
        filas.add(e(2024,  5,"Santander de Quilichao", CategoriaEvento.HOSTIGAMIENTO,     Actor.SEGUNDA_MARQUETALIA,null,               NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));
        filas.add(e(2024,  6,"Santander de Quilichao", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,              NivelVisibilidad.PUBLICA,  2,2,0, 1,1,  0,  0));
        filas.add(e(2024,  7,"Santander de Quilichao", CategoriaEvento.SECUESTRO,         Actor.ELN,               null,               NivelVisibilidad.PRIVADA,  0,0,0, 0,0,  0,  0));
        filas.add(e(2024,  8,"Santander de Quilichao", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,              NivelVisibilidad.PUBLICA,  3,3,0, 2,2,  0,  0));
        filas.add(e(2024,  9,"Santander de Quilichao", CategoriaEvento.ENFRENTAMIENTO,    Actor.GRUPO_ARMADO_ORGANIZADO,Actor.FUERZA_PUBLICA,NivelVisibilidad.PUBLICA, 1,0,1, 2,1,  0,  0));
        filas.add(e(2024, 10,"Santander de Quilichao", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,              NivelVisibilidad.PUBLICA,  2,2,0, 0,0,  0,  0));
        filas.add(e(2024, 11,"Santander de Quilichao", CategoriaEvento.RECLUTAMIENTO_ILICITO,Actor.SEGUNDA_MARQUETALIA,null,             NivelVisibilidad.PRIVADA,  0,0,0, 0,0,  0,  0));
        filas.add(e(2024, 12,"Santander de Quilichao", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,              NivelVisibilidad.PUBLICA,  4,4,0, 1,1,  0,  0));

        filas.add(e(2025,  1,"Santander de Quilichao", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,              NivelVisibilidad.PUBLICA,  2,2,0, 0,0,  0,  0));
        filas.add(e(2025,  2,"Santander de Quilichao", CategoriaEvento.HOSTIGAMIENTO,     Actor.SEGUNDA_MARQUETALIA,null,               NivelVisibilidad.PUBLICA,  0,0,0, 1,1,  0,  0));
        filas.add(e(2025,  3,"Santander de Quilichao", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,              NivelVisibilidad.PUBLICA,  3,3,0, 2,2,  0,  0));
        filas.add(e(2025,  4,"Santander de Quilichao", CategoriaEvento.RECLUTAMIENTO_ILICITO,Actor.ELN,           null,              NivelVisibilidad.PRIVADA,  0,0,0, 0,0,  0,  0));
        filas.add(e(2025,  5,"Santander de Quilichao", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,              NivelVisibilidad.PUBLICA,  2,2,0, 1,1,  0,  0));
        filas.add(e(2025,  6,"Santander de Quilichao", CategoriaEvento.ENFRENTAMIENTO,    Actor.GRUPO_ARMADO_ORGANIZADO,Actor.FUERZA_PUBLICA,NivelVisibilidad.PUBLICA, 2,1,1, 3,2,  0,  0));
        filas.add(e(2025,  7,"Santander de Quilichao", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,              NivelVisibilidad.PUBLICA,  4,4,0, 2,2,  0,  0));
        filas.add(e(2025,  8,"Santander de Quilichao", CategoriaEvento.HOSTIGAMIENTO,     Actor.SEGUNDA_MARQUETALIA,null,               NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));
        filas.add(e(2025,  9,"Santander de Quilichao", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,              NivelVisibilidad.PUBLICA,  3,3,0, 1,1,  0,  0));
        filas.add(e(2025, 10,"Santander de Quilichao", CategoriaEvento.RECLUTAMIENTO_ILICITO,Actor.SEGUNDA_MARQUETALIA,null,             NivelVisibilidad.PRIVADA,  0,0,0, 0,0,  0,  0));
        filas.add(e(2025, 11,"Santander de Quilichao", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,              NivelVisibilidad.PUBLICA,  2,2,0, 0,0,  0,  0));
        filas.add(e(2025, 12,"Santander de Quilichao", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,              NivelVisibilidad.PUBLICA,  5,5,0, 3,3,  0,  0));

        filas.add(e(2026,  1,"Santander de Quilichao", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,              NivelVisibilidad.PUBLICA,  2,2,0, 1,1,  0,  0));
        filas.add(e(2026,  2,"Santander de Quilichao", CategoriaEvento.HOSTIGAMIENTO,     Actor.SEGUNDA_MARQUETALIA,null,               NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));
        filas.add(e(2026,  3,"Santander de Quilichao", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,              NivelVisibilidad.PUBLICA,  3,3,0, 1,1,  0,  0));
        filas.add(e(2026,  4,"Santander de Quilichao", CategoriaEvento.RECLUTAMIENTO_ILICITO,Actor.ELN,           null,              NivelVisibilidad.PRIVADA,  0,0,0, 0,0,  0,  0));

        // ─── CORINTO – zona cocalera, disputada ───────────────────────────────
        filas.add(e(2024,  2,"Corinto", CategoriaEvento.HOSTIGAMIENTO,     Actor.GRUPO_ARMADO_ORGANIZADO,Actor.FUERZA_PUBLICA, NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));
        filas.add(e(2024,  4,"Corinto", CategoriaEvento.ENFRENTAMIENTO,    Actor.SEGUNDA_MARQUETALIA, Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  2,1,1, 3,2,  0,  0));
        filas.add(e(2024,  4,"Corinto", CategoriaEvento.ATENTADO_TERRORISTA,Actor.GRUPO_ARMADO_ORGANIZADO,null,               NivelVisibilidad.PUBLICA,  0,0,0, 1,1,  0,  0));
        filas.add(e(2024,  6,"Corinto", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  3,1,2, 4,3,180,  0));
        filas.add(e(2024,  8,"Corinto", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,               NivelVisibilidad.PUBLICA,  2,2,0, 0,0,  0,  0));
        filas.add(e(2024,  9,"Corinto", CategoriaEvento.HOSTIGAMIENTO,     Actor.SEGUNDA_MARQUETALIA,null,                   NivelVisibilidad.PUBLICA,  0,0,0, 3,3,  0,  0));
        filas.add(e(2024, 11,"Corinto", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  1,0,1, 2,1,  0,  0));
        filas.add(e(2024, 12,"Corinto", CategoriaEvento.ATENTADO_TERRORISTA,Actor.SEGUNDA_MARQUETALIA,null,                  NivelVisibilidad.PUBLICA,  0,0,0, 4,4,  0,  0));

        filas.add(e(2025,  1,"Corinto", CategoriaEvento.HOSTIGAMIENTO,     Actor.GRUPO_ARMADO_ORGANIZADO,Actor.FUERZA_PUBLICA, NivelVisibilidad.PUBLICA,  0,0,0, 1,1,  0,  0));
        filas.add(e(2025,  3,"Corinto", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  2,0,2, 3,2,120,  0));
        filas.add(e(2025,  5,"Corinto", CategoriaEvento.ATENTADO_TERRORISTA,Actor.GRUPO_ARMADO_ORGANIZADO,null,               NivelVisibilidad.PUBLICA,  0,0,0, 3,3,  0,  0));
        filas.add(e(2025,  6,"Corinto", CategoriaEvento.ENFRENTAMIENTO,    Actor.SEGUNDA_MARQUETALIA, Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  3,1,2, 5,4,200,  0));
        filas.add(e(2025,  7,"Corinto", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,               NivelVisibilidad.PUBLICA,  2,2,0, 1,1,  0,  0));
        filas.add(e(2025,  9,"Corinto", CategoriaEvento.HOSTIGAMIENTO,     Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));
        filas.add(e(2025, 11,"Corinto", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  4,2,2, 6,4,250,  0));
        filas.add(e(2025, 12,"Corinto", CategoriaEvento.ATENTADO_TERRORISTA,Actor.SEGUNDA_MARQUETALIA,null,                  NivelVisibilidad.PUBLICA,  0,0,0, 3,3,  0,  0));

        filas.add(e(2026,  2,"Corinto", CategoriaEvento.HOSTIGAMIENTO,     Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));
        filas.add(e(2026,  3,"Corinto", CategoriaEvento.ENFRENTAMIENTO,    Actor.SEGUNDA_MARQUETALIA, Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  2,1,1, 3,2, 80,  0));
        filas.add(e(2026,  4,"Corinto", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,               NivelVisibilidad.PUBLICA,  1,1,0, 0,0,  0,  0));

        // ─── MIRANDA – zona de tránsito ───────────────────────────────────────
        filas.add(e(2024,  3,"Miranda", CategoriaEvento.RETEN_ILEGAL,      Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 0,0,  0,  0));
        filas.add(e(2024,  5,"Miranda", CategoriaEvento.HOSTIGAMIENTO,     Actor.SEGUNDA_MARQUETALIA,null,                   NivelVisibilidad.PUBLICA,  0,0,0, 1,1,  0,  0));
        filas.add(e(2024,  6,"Miranda", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  1,0,1, 2,1,  0,  0));
        filas.add(e(2024,  8,"Miranda", CategoriaEvento.RETEN_ILEGAL,      Actor.GRUPO_ARMADO_ORGANIZADO,null,               NivelVisibilidad.PUBLICA,  0,0,0, 0,0,  0,  0));
        filas.add(e(2024, 10,"Miranda", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,               NivelVisibilidad.PUBLICA,  1,1,0, 0,0,  0,  0));
        filas.add(e(2024, 11,"Miranda", CategoriaEvento.HOSTIGAMIENTO,     Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));

        filas.add(e(2025,  2,"Miranda", CategoriaEvento.RETEN_ILEGAL,      Actor.SEGUNDA_MARQUETALIA,null,                   NivelVisibilidad.PUBLICA,  0,0,0, 0,0,  0,  0));
        filas.add(e(2025,  4,"Miranda", CategoriaEvento.HOSTIGAMIENTO,     Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));
        filas.add(e(2025,  5,"Miranda", CategoriaEvento.ENFRENTAMIENTO,    Actor.GRUPO_ARMADO_ORGANIZADO,Actor.FUERZA_PUBLICA,NivelVisibilidad.PUBLICA, 2,1,1, 3,2,  0,  0));
        filas.add(e(2025,  7,"Miranda", CategoriaEvento.RETEN_ILEGAL,      Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 0,0,  0,  0));
        filas.add(e(2025,  9,"Miranda", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,               NivelVisibilidad.PUBLICA,  2,2,0, 0,0,  0,  0));
        filas.add(e(2025, 10,"Miranda", CategoriaEvento.HOSTIGAMIENTO,     Actor.SEGUNDA_MARQUETALIA,null,                   NivelVisibilidad.PUBLICA,  0,0,0, 1,1,  0,  0));
        filas.add(e(2025, 12,"Miranda", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  1,0,1, 2,1, 60,  0));

        filas.add(e(2026,  1,"Miranda", CategoriaEvento.RETEN_ILEGAL,      Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 0,0,  0,  0));
        filas.add(e(2026,  3,"Miranda", CategoriaEvento.HOSTIGAMIENTO,     Actor.SEGUNDA_MARQUETALIA,null,                   NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));

        // ─── POPAYÁN – capital, conflicto urbano y político ───────────────────
        filas.add(e(2024,  1,"Popayán", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,               NivelVisibilidad.PUBLICA,  1,1,0, 0,0,  0,  0));
        filas.add(e(2024,  2,"Popayán", CategoriaEvento.ACCION_DE_PROTESTA,Actor.COMUNIDAD_CIVIL,   null,                   NivelVisibilidad.PUBLICA,  0,0,0, 3,3,  0,  0));
        filas.add(e(2024,  4,"Popayán", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,               NivelVisibilidad.PUBLICA,  2,2,0, 1,1,  0,  0));
        filas.add(e(2024,  5,"Popayán", CategoriaEvento.RECLUTAMIENTO_ILICITO,Actor.ELN,            null,                   NivelVisibilidad.PRIVADA,  0,0,0, 0,0,  0,  0));
        filas.add(e(2024,  6,"Popayán", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,               NivelVisibilidad.PUBLICA,  1,1,0, 0,0,  0,  0));
        filas.add(e(2024,  7,"Popayán", CategoriaEvento.ACCION_DE_PROTESTA,Actor.COMUNIDAD_CIVIL,   null,                   NivelVisibilidad.PUBLICA,  0,0,0, 5,5,  0,  0));
        filas.add(e(2024,  8,"Popayán", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,               NivelVisibilidad.PUBLICA,  2,2,0, 1,1,  0,  0));
        filas.add(e(2024,  9,"Popayán", CategoriaEvento.HOSTIGAMIENTO,     Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));
        filas.add(e(2024, 10,"Popayán", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,               NivelVisibilidad.PUBLICA,  3,3,0, 1,1,  0,  0));
        filas.add(e(2024, 11,"Popayán", CategoriaEvento.RECLUTAMIENTO_ILICITO,Actor.SEGUNDA_MARQUETALIA,null,               NivelVisibilidad.PRIVADA,  0,0,0, 0,0,  0,  0));
        filas.add(e(2024, 12,"Popayán", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,               NivelVisibilidad.PUBLICA,  2,2,0, 0,0,  0,  0));

        filas.add(e(2025,  1,"Popayán", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,               NivelVisibilidad.PUBLICA,  2,2,0, 1,1,  0,  0));
        filas.add(e(2025,  2,"Popayán", CategoriaEvento.ACCION_DE_PROTESTA,Actor.COMUNIDAD_CIVIL,   null,                   NivelVisibilidad.PUBLICA,  0,0,0, 4,4,  0,  0));
        filas.add(e(2025,  3,"Popayán", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,               NivelVisibilidad.PUBLICA,  1,1,0, 0,0,  0,  0));
        filas.add(e(2025,  4,"Popayán", CategoriaEvento.RECLUTAMIENTO_ILICITO,Actor.ELN,            null,                   NivelVisibilidad.PRIVADA,  0,0,0, 0,0,  0,  0));
        filas.add(e(2025,  5,"Popayán", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,               NivelVisibilidad.PUBLICA,  3,3,0, 2,2,  0,  0));
        filas.add(e(2025,  6,"Popayán", CategoriaEvento.HOSTIGAMIENTO,     Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));
        filas.add(e(2025,  7,"Popayán", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,               NivelVisibilidad.PUBLICA,  2,2,0, 1,1,  0,  0));
        filas.add(e(2025,  8,"Popayán", CategoriaEvento.ACCION_DE_PROTESTA,Actor.COMUNIDAD_CIVIL,   null,                   NivelVisibilidad.PUBLICA,  0,0,0, 6,6,  0,  0));
        filas.add(e(2025,  9,"Popayán", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,               NivelVisibilidad.PUBLICA,  1,1,0, 0,0,  0,  0));
        filas.add(e(2025, 10,"Popayán", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,               NivelVisibilidad.PUBLICA,  3,3,0, 2,2,  0,  0));
        filas.add(e(2025, 11,"Popayán", CategoriaEvento.HOSTIGAMIENTO,     Actor.SEGUNDA_MARQUETALIA,null,                   NivelVisibilidad.PUBLICA,  0,0,0, 1,1,  0,  0));
        filas.add(e(2025, 12,"Popayán", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,               NivelVisibilidad.PUBLICA,  2,2,0, 1,1,  0,  0));

        filas.add(e(2026,  1,"Popayán", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,               NivelVisibilidad.PUBLICA,  1,1,0, 0,0,  0,  0));
        filas.add(e(2026,  2,"Popayán", CategoriaEvento.ACCION_DE_PROTESTA,Actor.COMUNIDAD_CIVIL,   null,                   NivelVisibilidad.PUBLICA,  0,0,0, 3,3,  0,  0));
        filas.add(e(2026,  3,"Popayán", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,               NivelVisibilidad.PUBLICA,  2,2,0, 1,1,  0,  0));
        filas.add(e(2026,  4,"Popayán", CategoriaEvento.HOSTIGAMIENTO,     Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));

        // ─── BUENOS AIRES – zona minera conflictiva ────────────────────────────
        filas.add(e(2024,  4,"Buenos Aires", CategoriaEvento.HALLAZGO_DE_MATERIAL,Actor.FUERZA_PUBLICA,null,              NivelVisibilidad.PUBLICA,  0,0,0, 0,0,  0,  0));
        filas.add(e(2024,  6,"Buenos Aires", CategoriaEvento.HOSTIGAMIENTO,     Actor.ELN,               null,           NivelVisibilidad.PUBLICA,  0,0,0, 1,1,  0,  0));
        filas.add(e(2024,  8,"Buenos Aires", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,NivelVisibilidad.PUBLICA,1,0,1, 2,1, 50,  0));
        filas.add(e(2024, 10,"Buenos Aires", CategoriaEvento.HALLAZGO_DE_MATERIAL,Actor.FUERZA_PUBLICA,null,              NivelVisibilidad.PUBLICA,  0,0,0, 0,0,  0,  0));
        filas.add(e(2025,  3,"Buenos Aires", CategoriaEvento.HOSTIGAMIENTO,     Actor.SEGUNDA_MARQUETALIA,null,           NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));
        filas.add(e(2025,  7,"Buenos Aires", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,NivelVisibilidad.PUBLICA,2,1,1, 4,3, 90,  0));
        filas.add(e(2025, 11,"Buenos Aires", CategoriaEvento.HALLAZGO_DE_MATERIAL,Actor.FUERZA_PUBLICA,null,              NivelVisibilidad.PUBLICA,  0,0,0, 0,0,  0,  0));
        filas.add(e(2026,  2,"Buenos Aires", CategoriaEvento.HOSTIGAMIENTO,     Actor.ELN,               null,           NivelVisibilidad.PUBLICA,  0,0,0, 1,1,  0,  0));

        // ─── CALOTO – zona de disputa histórica ───────────────────────────────
        filas.add(e(2024,  2,"Caloto", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  2,1,1, 3,2,  0,  0));
        filas.add(e(2024,  5,"Caloto", CategoriaEvento.HOSTIGAMIENTO,     Actor.SEGUNDA_MARQUETALIA,null,                  NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));
        filas.add(e(2024,  7,"Caloto", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  3,1,2, 4,3,100,  0));
        filas.add(e(2024,  9,"Caloto", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,              NivelVisibilidad.PUBLICA,  1,1,0, 0,0,  0,  0));
        filas.add(e(2024, 11,"Caloto", CategoriaEvento.OTRO,     Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 0,0,  0,200));
        filas.add(e(2025,  2,"Caloto", CategoriaEvento.ENFRENTAMIENTO,    Actor.SEGUNDA_MARQUETALIA,Actor.FUERZA_PUBLICA,  NivelVisibilidad.PUBLICA,  4,2,2, 6,4,150,  0));
        filas.add(e(2025,  4,"Caloto", CategoriaEvento.OTRO,     Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 0,0,  0,350));
        filas.add(e(2025,  6,"Caloto", CategoriaEvento.HOMICIDIO,         Actor.GRUPO_ARMADO_ORGANIZADO,null,              NivelVisibilidad.PUBLICA,  2,2,0, 1,1,  0,  0));
        filas.add(e(2025,  8,"Caloto", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  3,1,2, 5,3,200,  0));
        filas.add(e(2025, 10,"Caloto", CategoriaEvento.HOSTIGAMIENTO,     Actor.SEGUNDA_MARQUETALIA,null,                  NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));
        filas.add(e(2025, 12,"Caloto", CategoriaEvento.OTRO,     Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 0,0,  0,500));
        filas.add(e(2026,  1,"Caloto", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  2,0,2, 3,2,  0,  0));
        filas.add(e(2026,  3,"Caloto", CategoriaEvento.OTRO,     Actor.SEGUNDA_MARQUETALIA,null,                  NivelVisibilidad.PUBLICA,  0,0,0, 0,0,  0,280));

        // ─── CAJIBÍO – zona rural andina ──────────────────────────────────────
        filas.add(e(2024,  3,"Cajibío", CategoriaEvento.HOSTIGAMIENTO,    Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 1,1,  0,  0));
        filas.add(e(2024,  6,"Cajibío", CategoriaEvento.RECLUTAMIENTO_ILICITO,Actor.ELN,           null,                   NivelVisibilidad.PRIVADA,  0,0,0, 0,0,  0,  0));
        filas.add(e(2024,  9,"Cajibío", CategoriaEvento.ENFRENTAMIENTO,   Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  1,0,1, 2,1, 80,  0));
        filas.add(e(2024, 12,"Cajibío", CategoriaEvento.HOMICIDIO,        Actor.GRUPO_ARMADO_ORGANIZADO,null,              NivelVisibilidad.PUBLICA,  2,2,0, 0,0,  0,  0));
        filas.add(e(2025,  2,"Cajibío", CategoriaEvento.HOSTIGAMIENTO,    Actor.SEGUNDA_MARQUETALIA,null,                  NivelVisibilidad.PUBLICA,  0,0,0, 3,3,  0,  0));
        filas.add(e(2025,  5,"Cajibío", CategoriaEvento.ENFRENTAMIENTO,   Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  2,1,1, 4,3,120,  0));
        filas.add(e(2025,  8,"Cajibío", CategoriaEvento.OTRO,    Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 0,0,  0,400));
        filas.add(e(2025, 11,"Cajibío", CategoriaEvento.HOMICIDIO,        Actor.GRUPO_ARMADO_ORGANIZADO,null,              NivelVisibilidad.PUBLICA,  1,1,0, 1,1,  0,  0));
        filas.add(e(2026,  2,"Cajibío", CategoriaEvento.ENFRENTAMIENTO,   Actor.SEGUNDA_MARQUETALIA,Actor.FUERZA_PUBLICA,  NivelVisibilidad.PUBLICA,  2,1,1, 3,2, 60,  0));
        filas.add(e(2026,  4,"Cajibío", CategoriaEvento.OTRO,    Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 0,0,  0,320));

        // ─── MORALES – corredor estratégico ───────────────────────────────────
        filas.add(e(2024,  4,"Morales", CategoriaEvento.HOSTIGAMIENTO,    Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));
        filas.add(e(2024,  7,"Morales", CategoriaEvento.ENFRENTAMIENTO,   Actor.SEGUNDA_MARQUETALIA,Actor.FUERZA_PUBLICA,  NivelVisibilidad.PUBLICA,  3,1,2, 5,3,160,  0));
        filas.add(e(2024, 10,"Morales", CategoriaEvento.HOMICIDIO,        Actor.GRUPO_ARMADO_ORGANIZADO,null,              NivelVisibilidad.PUBLICA,  1,1,0, 0,0,  0,  0));
        filas.add(e(2025,  1,"Morales", CategoriaEvento.OTRO,    Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 0,0,  0,600));
        filas.add(e(2025,  4,"Morales", CategoriaEvento.ENFRENTAMIENTO,   Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  4,2,2, 6,4,200,  0));
        filas.add(e(2025,  7,"Morales", CategoriaEvento.HOSTIGAMIENTO,    Actor.SEGUNDA_MARQUETALIA,null,                  NivelVisibilidad.PUBLICA,  0,0,0, 3,3,  0,  0));
        filas.add(e(2025, 10,"Morales", CategoriaEvento.OTRO,    Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 0,0,  0,450));
        filas.add(e(2026,  2,"Morales", CategoriaEvento.ENFRENTAMIENTO,   Actor.SEGUNDA_MARQUETALIA,Actor.FUERZA_PUBLICA,  NivelVisibilidad.PUBLICA,  2,0,2, 4,3, 90,  0));
        filas.add(e(2026,  4,"Morales", CategoriaEvento.OTRO,    Actor.SEGUNDA_MARQUETALIA,null,                  NivelVisibilidad.PUBLICA,  0,0,0, 0,0,  0,380));

        // ─── SUÁREZ – zona minera y de desplazamiento ─────────────────────────
        filas.add(e(2024,  1,"Suárez", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  2,1,1, 3,2,  0,  0));
        filas.add(e(2024,  3,"Suárez", CategoriaEvento.OTRO,    Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 0,0,500,  0));
        filas.add(e(2024,  5,"Suárez", CategoriaEvento.HOSTIGAMIENTO,     Actor.SEGUNDA_MARQUETALIA,null,                  NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));
        filas.add(e(2024,  8,"Suárez", CategoriaEvento.OTRO,    Actor.SEGUNDA_MARQUETALIA,null,                  NivelVisibilidad.PUBLICA,  0,0,0, 0,0,800,  0));
        filas.add(e(2024, 11,"Suárez", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  3,1,2, 5,4,  0,  0));
        filas.add(e(2025,  2,"Suárez", CategoriaEvento.OTRO,    Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 0,0,650,  0));
        filas.add(e(2025,  5,"Suárez", CategoriaEvento.ENFRENTAMIENTO,    Actor.SEGUNDA_MARQUETALIA,Actor.FUERZA_PUBLICA,  NivelVisibilidad.PUBLICA,  4,2,2, 6,4,  0,  0));
        filas.add(e(2025,  8,"Suárez", CategoriaEvento.OTRO,    Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 0,0,900,  0));
        filas.add(e(2025, 11,"Suárez", CategoriaEvento.HOSTIGAMIENTO,     Actor.GRUPO_ARMADO_ORGANIZADO,null,              NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));
        filas.add(e(2026,  1,"Suárez", CategoriaEvento.OTRO,    Actor.SEGUNDA_MARQUETALIA,null,                  NivelVisibilidad.PUBLICA,  0,0,0, 0,0,400,  0));
        filas.add(e(2026,  3,"Suárez", CategoriaEvento.ENFRENTAMIENTO,    Actor.ELN,               Actor.FUERZA_PUBLICA,   NivelVisibilidad.PUBLICA,  2,1,1, 3,2,  0,  0));

        // ─── MERCADERES – zona fronteriza sur ─────────────────────────────────
        filas.add(e(2024,  2,"Mercaderes", CategoriaEvento.HOSTIGAMIENTO,  Actor.GRUPO_ARMADO_ORGANIZADO,null,             NivelVisibilidad.PUBLICA,  0,0,0, 1,1,  0,  0));
        filas.add(e(2024,  6,"Mercaderes", CategoriaEvento.RECLUTAMIENTO_ILICITO,Actor.ELN,        null,                   NivelVisibilidad.PRIVADA,  0,0,0, 0,0,  0,  0));
        filas.add(e(2024,  9,"Mercaderes", CategoriaEvento.HOMICIDIO,      Actor.GRUPO_ARMADO_ORGANIZADO,null,             NivelVisibilidad.PUBLICA,  2,2,0, 1,1,  0,  0));
        filas.add(e(2025,  1,"Mercaderes", CategoriaEvento.ENFRENTAMIENTO, Actor.ELN,               Actor.FUERZA_PUBLICA,  NivelVisibilidad.PUBLICA,  1,0,1, 2,1, 70,  0));
        filas.add(e(2025,  5,"Mercaderes", CategoriaEvento.HOSTIGAMIENTO,  Actor.SEGUNDA_MARQUETALIA,null,                 NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));
        filas.add(e(2025,  9,"Mercaderes", CategoriaEvento.HOMICIDIO,      Actor.GRUPO_ARMADO_ORGANIZADO,null,             NivelVisibilidad.PUBLICA,  3,3,0, 2,2,  0,  0));
        filas.add(e(2026,  2,"Mercaderes", CategoriaEvento.ENFRENTAMIENTO, Actor.ELN,               Actor.FUERZA_PUBLICA,  NivelVisibilidad.PUBLICA,  2,1,1, 3,2, 50,  0));

        // ─── LA VEGA – piedemonte costero ─────────────────────────────────────
        filas.add(e(2024,  4,"La Vega", CategoriaEvento.HOSTIGAMIENTO,    Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));
        filas.add(e(2024,  8,"La Vega", CategoriaEvento.ATENTADO_TERRORISTA,Actor.ELN,             null,                   NivelVisibilidad.PUBLICA,  0,0,0, 3,3,  0,  0));
        filas.add(e(2025,  2,"La Vega", CategoriaEvento.ENFRENTAMIENTO,   Actor.SEGUNDA_MARQUETALIA,Actor.FUERZA_PUBLICA,  NivelVisibilidad.PUBLICA,  2,1,1, 4,3,130,  0));
        filas.add(e(2025,  6,"La Vega", CategoriaEvento.OTRO,    Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 0,0,  0,480));
        filas.add(e(2025, 10,"La Vega", CategoriaEvento.HOMICIDIO,        Actor.GRUPO_ARMADO_ORGANIZADO,null,              NivelVisibilidad.PUBLICA,  1,1,0, 0,0,  0,  0));
        filas.add(e(2026,  1,"La Vega", CategoriaEvento.HOSTIGAMIENTO,    Actor.ELN,               null,                   NivelVisibilidad.PUBLICA,  0,0,0, 2,2,  0,  0));
        filas.add(e(2026,  3,"La Vega", CategoriaEvento.OTRO,    Actor.SEGUNDA_MARQUETALIA,null,                  NivelVisibilidad.PUBLICA,  0,0,0, 0,0,  0,310));

        // ─── Construir entidades ──────────────────────────────────────────────
        List<NovedadSnapshotEntity> snapshots = new ArrayList<>();
        for (Object[] f : filas) {
            snapshots.add(buildSnapshot(f));
        }
        return snapshots;
    }

    // =========================================================
    // AGREGADOS
    // =========================================================
    private void construirAgregados(List<NovedadSnapshotEntity> snapshots) {
        Map<String, EstadisticaAgregadaEntity> mapa = new LinkedHashMap<>();

        for (NovedadSnapshotEntity s : snapshots) {
            String clave = s.getAnio() + "|" + s.getMes() + "|"
                    + s.getMunicipio() + "|" + s.getCategoria()
                    + "|" + s.getNivelVisibilidad();

            EstadisticaAgregadaEntity agg = mapa.computeIfAbsent(clave, k ->
                    EstadisticaAgregadaEntity.builder()
                            .anio(s.getAnio())
                            .mes(s.getMes())
                            .municipio(s.getMunicipio())
                            .categoria(s.getCategoria())
                            .nivelVisibilidad(s.getNivelVisibilidad())
                            .build()
            );

            agg.incrementar(
                    s.getMuertosTotales(),   s.getMuertosCiviles(),   s.getMuertosFuerzaPublica(),
                    s.getHeridosTotales(),   s.getHeridosCiviles(),
                    s.getDesplazadosTotales(), s.getConfinadosTotales()
            );
        }

        agregadaRepository.saveAll(mapa.values());
    }

    // =========================================================
    // HELPERS DE CONSTRUCCIÓN
    // =========================================================

    /**
     * Crea el array de parámetros para buildSnapshot.
     * Orden: anio, mes, municipio, cat, actor1, actor2,
     *        visib, muertos, muertosCiv, muertosFP,
     *        heridos, heridosCiv, desplazados, confinados
     */
    private Object[] e(int anio, int mes, String municipio,
                       CategoriaEvento cat, Actor actor1, Actor actor2,
                       NivelVisibilidad visib,
                       int muertos, int muertosCiv, int muertosFP,
                       int heridos, int heridosCiv,
                       int desplazados, int confinados) {
        return new Object[]{ anio, mes, municipio, cat, actor1, actor2, visib,
                             muertos, muertosCiv, muertosFP,
                             heridos, heridosCiv, desplazados, confinados };
    }

    private NovedadSnapshotEntity buildSnapshot(Object[] f) {
        int anio        = (int) f[0];
        int mes         = (int) f[1];
        String mun      = (String) f[2];
        CategoriaEvento cat     = (CategoriaEvento) f[3];
        Actor actor1    = (Actor) f[4];
        Actor actor2    = (Actor) f[5];
        NivelVisibilidad vis = (NivelVisibilidad) f[6];
        int muertos     = (int) f[7];
        int muertosCiv  = (int) f[8];
        int muertosFP   = (int) f[9];
        int heridos     = (int) f[10];
        int heridosCiv  = (int) f[11];
        int desplazados = (int) f[12];
        int confinados  = (int) f[13];

        return NovedadSnapshotEntity.builder()
                .novedadId(UUID.randomUUID())
                .usuarioId(UUID.fromString("00000000-0000-0000-0000-000000000001"))
                .fechaHecho(LocalDate.of(anio, mes, 15))
                .anio(anio)
                .mes(mes)
                .municipio(mun)
                .categoria(cat)
                .actor1(actor1)
                .actor2(actor2)
                .nivelVisibilidad(vis)
                .nivelConfianza(NivelConfianza.CONFIRMADO)
                .muertosTotales(muertos)
                .muertosCiviles(muertosCiv)
                .muertosFuerzaPublica(muertosFP)
                .heridosTotales(heridos)
                .heridosCiviles(heridosCiv)
                .desplazadosTotales(desplazados)
                .confinadosTotales(confinados)
                .oculto(false)
                .descripcionHecho("Evento de prueba - " + cat + " en " + mun)
                .localidadEspecifica(mun + " - Zona urbana")
                .build();
    }

    // =========================================================
    // VÍCTIMAS INDIVIDUALES
    // Cubre todos los valores de TipoVictima, Genero, GrupoPoblacional y RangoEdad.
    // Desplazados y confinados se muestrean a máximo 12 por evento.
    // =========================================================
    private List<VictimaSnapshotEntity> construirVictimas(List<NovedadSnapshotEntity> snapshots) {
        List<VictimaSnapshotEntity> lista = new ArrayList<>();

        // Género: ciclo que garantiza todos los valores (incluyendo NO_ESPECIFICADO y LGBTI_PLUS)
        Genero[] generosCombate = {
            Genero.MASCULINO, Genero.MASCULINO, Genero.MASCULINO, Genero.FEMENINO, Genero.NO_ESPECIFICADO
        };
        Genero[] generosCivil = {
            Genero.MASCULINO, Genero.FEMENINO, Genero.MASCULINO, Genero.FEMENINO,
            Genero.LGBTI_PLUS, Genero.MASCULINO, Genero.NO_ESPECIFICADO, Genero.FEMENINO
        };

        // Edades: cubren todos los rangos (0-19, 20-39, 40-59, 60-79, 80+)
        int[] edadesFP   = { 22, 24, 27, 30, 33, 36, 29, 26, 31, 23 };
        int[] edadesCiv  = {  8, 16, 23, 35, 42, 55, 67, 82, 12, 28,
                             45, 63, 72, 18,  5, 38, 51, 79, 85, 19 };
        int[] edadesDespla = {  7, 14, 25, 35, 44, 55, 62, 75, 83,  9,
                               17, 31, 47, 58, 68, 80,  3, 21, 40, 66 };

        // Grupos poblacionales – ciclos que cubren todos los 9 valores
        GrupoPoblacional[] gruposCiv = {
            GrupoPoblacional.ADULTO,       GrupoPoblacional.CAMPESINO,    GrupoPoblacional.INDIGENA,
            GrupoPoblacional.AFRODESCENDIENTE, GrupoPoblacional.NINO,    GrupoPoblacional.ADOLESCENTE,
            GrupoPoblacional.ADULTO_MAYOR, GrupoPoblacional.DISCAPACIDAD, GrupoPoblacional.OTRO
        };
        GrupoPoblacional[] gruposDespl = {
            GrupoPoblacional.CAMPESINO,    GrupoPoblacional.ADULTO,       GrupoPoblacional.INDIGENA,
            GrupoPoblacional.AFRODESCENDIENTE, GrupoPoblacional.ADOLESCENTE, GrupoPoblacional.NINO,
            GrupoPoblacional.ADULTO_MAYOR, GrupoPoblacional.DISCAPACIDAD, GrupoPoblacional.OTRO,
            GrupoPoblacional.CAMPESINO,    GrupoPoblacional.INDIGENA,     GrupoPoblacional.ADULTO
        };

        int idx = 0;
        for (NovedadSnapshotEntity s : snapshots) {
            UUID nid = s.getNovedadId();
            NivelVisibilidad vis = s.getNivelVisibilidad();

            // Víctimas fatales civiles
            for (int i = 0; i < s.getMuertosCiviles(); i++, idx++) {
                lista.add(v(nid, s,
                        generosCivil[idx % generosCivil.length],
                        edadesCiv[idx % edadesCiv.length],
                        gruposCiv[idx % gruposCiv.length], vis));
            }
            // Víctimas fatales fuerza pública
            for (int i = 0; i < s.getMuertosFuerzaPublica(); i++, idx++) {
                lista.add(v(nid, s,
                        generosCombate[idx % generosCombate.length],
                        edadesFP[idx % edadesFP.length],
                        GrupoPoblacional.ADULTO, vis));
            }
            // Víctimas heridas civiles
            for (int i = 0; i < s.getHeridosCiviles(); i++, idx++) {
                lista.add(v(nid, s,
                        generosCivil[idx % generosCivil.length],
                        edadesCiv[idx % edadesCiv.length],
                        gruposCiv[idx % gruposCiv.length], vis));
            }
            // Víctimas heridas fuerza pública (heridosTotales − heridosCiviles)
            int heridosFP = Math.max(0, s.getHeridosTotales() - s.getHeridosCiviles());
            for (int i = 0; i < heridosFP; i++, idx++) {
                lista.add(v(nid, s,
                        generosCombate[idx % generosCombate.length],
                        edadesFP[idx % edadesFP.length],
                        GrupoPoblacional.ADULTO, vis));
            }
            // Población desplazada – máximo 12 registros por evento
            int sampledDespl = Math.min(s.getDesplazadosTotales(), 12);
            for (int i = 0; i < sampledDespl; i++, idx++) {
                lista.add(v(nid, s,
                        generosCivil[idx % generosCivil.length],
                        edadesDespla[idx % edadesDespla.length],
                        gruposDespl[idx % gruposDespl.length], vis));
            }
            // Población confinada – máximo 12 registros por evento
            int sampledConf = Math.min(s.getConfinadosTotales(), 12);
            for (int i = 0; i < sampledConf; i++, idx++) {
                lista.add(v(nid, s,
                        generosCivil[idx % generosCivil.length],
                        edadesDespla[idx % edadesDespla.length],
                        gruposDespl[idx % gruposDespl.length], vis));
            }
        }

        return lista;
    }

    private VictimaSnapshotEntity v(UUID novedadId, NovedadSnapshotEntity s,
                                    Genero genero, Integer edad,
                                    GrupoPoblacional grupo, NivelVisibilidad vis) {
        return VictimaSnapshotEntity.builder()
                .novedadId(novedadId)
                .anio(s.getAnio())
                .mes(s.getMes())
                .municipio(s.getMunicipio())
                .categoria(s.getCategoria())
                .genero(genero)
                .edad(edad)
                .grupoPoblacional(grupo)
                .nivelVisibilidad(vis)
                .build();
    }
}
