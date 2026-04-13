package co.edu.unicauca.microreportes.capaAccesoDatos.models;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.CategoriaEvento;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.NivelVisibilidad;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Tabla de agregaciones pre-computadas.
 * Clave compuesta: (anio, mes, municipio, categoria, nivelVisibilidad)
 *
 * Patrón: Materialized Aggregation / Write-behind cache
 * Se actualiza incrementalmente al procesar cada evento.
 */
@Entity
@Table(name = "estadistica_agregada", indexes = {
        @Index(name = "idx_agg_anio", columnList = "anio"),
        @Index(name = "idx_agg_municipio", columnList = "municipio"),
        @Index(name = "idx_agg_compuesto", columnList = "anio, municipio, nivel_visibilidad")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_agg_cube",
                columnNames = {"anio", "mes", "municipio", "categoria", "nivel_visibilidad"})
})
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EstadisticaAgregadaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

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

    // Contadores agregados
    @Column(name = "total_eventos")
    @Builder.Default
    private Long totalEventos = 0L;

    @Column(name = "total_muertos")
    @Builder.Default
    private Long totalMuertos = 0L;

    @Column(name = "total_muertos_civiles")
    @Builder.Default
    private Long totalMuertosCiviles = 0L;

    @Column(name = "total_muertos_fuerza_publica")
    @Builder.Default
    private Long totalMuertosFuerzaPublica = 0L;

    @Column(name = "total_heridos")
    @Builder.Default
    private Long totalHeridos = 0L;

    @Column(name = "total_heridos_civiles")
    @Builder.Default
    private Long totalHeridosCiviles = 0L;

    @Column(name = "total_desplazados")
    @Builder.Default
    private Long totalDesplazados = 0L;

    @Column(name = "total_confinados")
    @Builder.Default
    private Long totalConfinados = 0L;

    @Column(name = "ultima_actualizacion")
    private LocalDateTime ultimaActualizacion;

    @PrePersist
    @PreUpdate
    public void actualizarTimestamp() {
        this.ultimaActualizacion = LocalDateTime.now();
    }

    /**
     * Incrementa contadores con los valores de una novedad nueva.
     */
    public void incrementar(int muertos, int muertosCiviles, int muertosFP,
                            int heridos, int heridosCiviles,
                            int desplazados, int confinados) {
        this.totalEventos++;
        this.totalMuertos += muertos;
        this.totalMuertosCiviles += muertosCiviles;
        this.totalMuertosFuerzaPublica += muertosFP;
        this.totalHeridos += heridos;
        this.totalHeridosCiviles += heridosCiviles;
        this.totalDesplazados += desplazados;
        this.totalConfinados += confinados;
    }

    /**
     * Decrementa contadores (para actualizaciones/eliminaciones).
     */
    public void decrementar(int muertos, int muertosCiviles, int muertosFP,
                            int heridos, int heridosCiviles,
                            int desplazados, int confinados) {
        this.totalEventos = Math.max(0, this.totalEventos - 1);
        this.totalMuertos = Math.max(0, this.totalMuertos - muertos);
        this.totalMuertosCiviles = Math.max(0, this.totalMuertosCiviles - muertosCiviles);
        this.totalMuertosFuerzaPublica = Math.max(0, this.totalMuertosFuerzaPublica - muertosFP);
        this.totalHeridos = Math.max(0, this.totalHeridos - heridos);
        this.totalHeridosCiviles = Math.max(0, this.totalHeridosCiviles - heridosCiviles);
        this.totalDesplazados = Math.max(0, this.totalDesplazados - desplazados);
        this.totalConfinados = Math.max(0, this.totalConfinados - confinados);
    }
}
