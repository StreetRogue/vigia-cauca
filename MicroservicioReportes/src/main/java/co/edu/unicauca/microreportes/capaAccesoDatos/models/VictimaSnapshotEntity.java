package co.edu.unicauca.microreportes.capaAccesoDatos.models;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.*;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Read Model de víctimas individuales para análisis demográfico.
 *
 * Campos espejados de VictimaEntity (MicroservicioNovedades):
 *   nombreVictima, genero (GeneroVictima), edadVictima, grupoPoblacional, ocupacionVictima
 *
 * Campos denormalizados desde NovedadEntity para consultas analíticas sin JOIN:
 *   anio, mes, municipio, categoria, nivelVisibilidad
 *
 * Patrón: CQRS Read Projection — poblado desde RabbitMQ vía ProyeccionService.
 */
@Entity
@Table(name = "victima_snapshot", indexes = {
        @Index(name = "idx_victima_novedad",    columnList = "novedad_id"),
        @Index(name = "idx_victima_anio_mes",   columnList = "anio, mes"),
        @Index(name = "idx_victima_municipio",  columnList = "municipio"),
        @Index(name = "idx_victima_rango_edad", columnList = "rango_edad"),
        @Index(name = "idx_victima_genero",     columnList = "genero"),
        @Index(name = "idx_victima_grupo",      columnList = "grupo_poblacional"),
        @Index(name = "idx_victima_compuesto",
               columnList = "anio, municipio, nivel_visibilidad")
})
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VictimaSnapshotEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "novedad_id", nullable = false)
    private UUID novedadId;

    // ─── Datos demográficos (espejo de VictimaEntity en MicroservicioNovedades) ───

    @Column(name = "nombre_victima")
    private String nombreVictima;

    @Enumerated(EnumType.STRING)
    @Column(name = "genero", nullable = false)
    @Builder.Default
    private Genero genero = Genero.NO_ESPECIFICADO;

    /** Edad en años. Puede ser null cuando no se registra. */
    @Column(name = "edad")
    private Integer edad;

    /**
     * Calculado automáticamente desde edad al persistir.
     * Si edad es null → NO_IDENTIFICADO.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "rango_edad", nullable = false)
    @Builder.Default
    private RangoEdad rangoEdad = RangoEdad.NO_IDENTIFICADO;

    @Enumerated(EnumType.STRING)
    @Column(name = "grupo_poblacional")
    private GrupoPoblacional grupoPoblacional;

    @Column(name = "ocupacion_victima")
    private String ocupacionVictima;

    // ─── Campos denormalizados desde NovedadEntity ───────────────────────────────

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
    @Column(name = "nivel_visibilidad", nullable = false)
    private NivelVisibilidad nivelVisibilidad;

    @Column(name = "oculto")
    @Builder.Default
    private Boolean oculto = false;

    @PrePersist
    @PreUpdate
    public void derivarRangoEdad() {
        this.rangoEdad = RangoEdad.fromEdad(this.edad);
    }
}
