package co.edu.unicauca.micronovedades.capaAccesoDatos.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "EVIDENCIA")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EvidenciaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_evidencia")
    private UUID idEvidencia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "novedad_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private NovedadEntity novedad;

    @Column(name = "url_archivo", nullable = false)
    private String urlArchivo;
}
