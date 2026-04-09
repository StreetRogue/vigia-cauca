package co.edu.unicauca.micronovedades.capaAccesoDatos.models;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.ReclutamientoMenoresFlag;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "AFECTACION_HUMANA")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AfectacionHumanaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_afectacion")
    private UUID idAfectacion;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_registro", nullable = false, unique = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private NovedadEntity novedad;

    @Column(name = "muertos_total")
    @Builder.Default
    private Integer muertosTotales = 0;

    @Column(name = "muertos_civiles")
    @Builder.Default
    private Integer muertosCiviles = 0;

    @Column(name = "muertos_fuerza_publica")
    @Builder.Default
    private Integer muertosFuerzaPublica = 0;

    @Column(name = "muertos_ilegales")
    @Builder.Default
    private Integer muertosIlegales = 0;

    @Column(name = "heridos_total")
    @Builder.Default
    private Integer heridosTotales = 0;

    @Column(name = "heridos_civiles")
    @Builder.Default
    private Integer heridosCiviles = 0;

    @Column(name = "heridos_fuerza_publica")
    @Builder.Default
    private Integer heridosFuerzaPublica = 0;

    @Column(name = "desplazados_total")
    @Builder.Default
    private Integer desplazadosTotales = 0;

    @Column(name = "confinados_total")
    @Builder.Default
    private Integer confinadosTotales = 0;

    @Column(name = "afectacion_civiles_flag")
    @Builder.Default
    private Boolean afectacionCivilesFlag = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "reclutamiento_menores_flag")
    @Builder.Default
    private ReclutamientoMenoresFlag reclutamientoMenoresFlag = ReclutamientoMenoresFlag.NO_APLICA;
}
