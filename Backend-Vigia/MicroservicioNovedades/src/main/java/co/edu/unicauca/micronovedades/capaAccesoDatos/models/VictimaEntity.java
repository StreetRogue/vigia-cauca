package co.edu.unicauca.micronovedades.capaAccesoDatos.models;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.GeneroVictima;
import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.GrupoPoblacional;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "VICTIMA")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VictimaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "victima_id")
    private UUID victimaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "novedad_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private NovedadEntity novedad;

    @Column(name = "nombre_victima", nullable = false)
    private String nombreVictima;

    @Enumerated(EnumType.STRING)
    @Column(name = "genero_victima", nullable = false)
    private GeneroVictima generoVictima;

    @Column(name = "edad_victima")
    private Integer edadVictima;

    @Enumerated(EnumType.STRING)
    @Column(name = "grupo_poblacional")
    private GrupoPoblacional grupoPoblacional;

    @Column(name = "ocupacion_victima")
    private String ocupacionVictima;
}
