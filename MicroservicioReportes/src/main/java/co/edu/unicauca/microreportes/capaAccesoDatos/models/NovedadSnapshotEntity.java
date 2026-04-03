package co.edu.unicauca.microreportes.capaAccesoDatos.models;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.*;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Read Model denormalizado de cada novedad.
 * Almacena los datos relevantes para estadísticas y reportes
 * sin depender del microservicio de novedades en tiempo de consulta.
 *
 * Patrón: CQRS Read Projection
 */
@Entity
@Table(name = "novedad_snapshot", indexes = {
        @Index(name = "idx_snapshot_municipio", columnList = "municipio"),
        @Index(name = "idx_snapshot_categoria", columnList = "categoria"),
        @Index(name = "idx_snapshot_fecha_hecho", columnList = "fecha_hecho"),
        @Index(name = "idx_snapshot_visibilidad", columnList = "nivel_visibilidad"),
        @Index(name = "idx_snapshot_anio_mes", columnList = "anio, mes"),
        @Index(name = "idx_snapshot_actor1", columnList = "actor1"),
        @Index(name = "idx_snapshot_compuesto", columnList = "anio, municipio, categoria, nivel_visibilidad")
})
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NovedadSnapshotEntity {

    @Id
    @Column(name = "novedad_id")
    private UUID novedadId;

    @Column(name = "usuario_id", nullable = false)
    private UUID usuarioId;

    @Column(name = "fecha_hecho", nullable = false)
    private LocalDate fechaHecho;

    @Column(name = "anio", nullable = false)
    private Integer anio;

    @Column(name = "mes", nullable = false)
    private Integer mes;

    @Column(name = "municipio", nullable = false)
    private String municipio;

    @Enumerated(EnumType.STRING)
    @Column(name = "categoria", nullable = false)
    private CategoriaEvento categoria;

    @Enumerated(EnumType.STRING)
    @Column(name = "actor1", nullable = false)
    private Actor actor1;

    @Enumerated(EnumType.STRING)
    @Column(name = "actor2")
    private Actor actor2;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel_confianza", nullable = false)
    private NivelConfianza nivelConfianza;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel_visibilidad", nullable = false)
    private NivelVisibilidad nivelVisibilidad;

    // Métricas de afectación humana (denormalizadas)
    @Column(name = "muertos_totales")
    @Builder.Default
    private Integer muertosTotales = 0;

    @Column(name = "muertos_civiles")
    @Builder.Default
    private Integer muertosCiviles = 0;

    @Column(name = "muertos_fuerza_publica")
    @Builder.Default
    private Integer muertosFuerzaPublica = 0;

    @Column(name = "heridos_totales")
    @Builder.Default
    private Integer heridosTotales = 0;

    @Column(name = "heridos_civiles")
    @Builder.Default
    private Integer heridosCiviles = 0;

    @Column(name = "desplazados_totales")
    @Builder.Default
    private Integer desplazadosTotales = 0;

    @Column(name = "confinados_totales")
    @Builder.Default
    private Integer confinadosTotales = 0;

    @Column(name = "descripcion_hecho", columnDefinition = "TEXT")
    private String descripcionHecho;

    @Column(name = "localidad_especifica")
    private String localidadEspecifica;

    @Column(name = "fecha_snapshot", nullable = false)
    private LocalDateTime fechaSnapshot;

    @Column(name = "version")
    @Builder.Default
    private Long version = 1L;

    @PrePersist
    public void prePersist() {
        this.fechaSnapshot = LocalDateTime.now();
        if (this.fechaHecho != null) {
            this.anio = this.fechaHecho.getYear();
            this.mes = this.fechaHecho.getMonthValue();
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.fechaSnapshot = LocalDateTime.now();
        if (this.fechaHecho != null) {
            this.anio = this.fechaHecho.getYear();
            this.mes = this.fechaHecho.getMonthValue();
        }
        this.version++;
    }
}
