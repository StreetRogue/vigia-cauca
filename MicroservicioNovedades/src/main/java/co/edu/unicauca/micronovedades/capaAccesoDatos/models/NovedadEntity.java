package co.edu.unicauca.micronovedades.capaAccesoDatos.models;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.*;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "NOVEDAD")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NovedadEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "novedad_id")
    private UUID novedadId;

    // Solo almacenamos la cédula del usuario (referencia al microservicio de usuarios)
    @Column(name = "usuario_id", nullable = false)
    private UUID usuarioId;

    @Column(name = "fecha_hecho", nullable = false)
    private LocalDate fechaHecho;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    @Column(name = "fecha_reporte", nullable = false)
    private LocalDate fechaReporte;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @Column(name = "municipio", nullable = false)
    private String municipio;

    @Column(name = "localidad_especifica", nullable = false)
    private String localidadEspecifica;

    @Enumerated(EnumType.STRING)
    @Column(name = "categoria", nullable = false)
    private CategoriaEvento categoria;

    @Enumerated(EnumType.STRING)
    @Column(name = "actor_1", nullable = false)
    private Actor actor1;

    @Enumerated(EnumType.STRING)
    @Column(name = "actor_2")
    private Actor actor2;

    @Column(name = "infraestructura_afectada")
    private String infraestructuraAfectada;

    @Column(name = "accion_institucional")
    private String accionInstitucional;

    @Column(name = "descripcion_hecho", nullable = false, columnDefinition = "TEXT")
    private String descripcionHecho;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel_confianza", nullable = false)
    private NivelConfianza nivelConfianza;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel_visibilidad", nullable = false)
    private NivelVisibilidad nivelVisibilidad;

    @Column(name = "usuario_actualizacion")
    private String usuarioActualizacion;

    @Column(name = "afectaciones_humanas_flag")
    @Builder.Default
    private Boolean afectacionesHumanas = false;

    @Column(name = "reporte_victimas_flag")
    @Builder.Default
    private Boolean reporteVictimas = false;

    // ==========================================
    // RELACIONES
    // ==========================================

    // ==========================================
    // RELACIONES (Modificado para evitar bucles)
    // ==========================================

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "novedad", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<VictimaEntity> victimas = new ArrayList<>();

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToOne(mappedBy = "novedad", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private AfectacionHumanaEntity afectacionHumana;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "novedad", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<EvidenciaEntity> evidencias = new ArrayList<>();

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "novedad", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    @Builder.Default
    private List<AuditoriaNovedadEntity> auditorias = new ArrayList<>();

    // ==========================================
    // MÉTODOS DE DOMINIO
    // ==========================================

    @PrePersist
    public void prePersist() {
        this.fechaReporte = LocalDate.now();
        this.fechaActualizacion = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }

    /**
     * Agrega una víctima manteniendo la relación bidireccional.
     */
    public void agregarVictima(VictimaEntity victima) {
        victimas.add(victima);
        victima.setNovedad(this);
    }

    /**
     * Agrega una evidencia manteniendo la relación bidireccional.
     */
    public void agregarEvidencia(EvidenciaEntity evidencia) {
        evidencias.add(evidencia);
        evidencia.setNovedad(this);
    }
}
