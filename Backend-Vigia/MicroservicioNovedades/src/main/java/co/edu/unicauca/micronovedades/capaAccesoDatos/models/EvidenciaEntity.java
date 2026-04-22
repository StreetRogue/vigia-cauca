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

    /** URL externa (modo legacy). Puede ser null cuando se usa almacenamiento en filesystem. */
    @Column(name = "url_archivo")
    private String urlArchivo;

    /** Nombre original del archivo subido (ej: foto_incidente.jpg). */
    @Column(name = "nombre_archivo")
    private String nombreArchivo;

    /** Ruta absoluta en el filesystem donde se guardó el archivo. */
    @Column(name = "ruta_archivo")
    private String rutaArchivo;

    /** MIME type del archivo (ej: image/jpeg). */
    @Column(name = "tipo_mime", length = 100)
    private String tipoMime;

    /** Tamaño del archivo en bytes. */
    @Column(name = "tamano_bytes")
    private Long tamanoBytes;
}
