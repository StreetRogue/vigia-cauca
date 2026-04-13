package co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EvidenciaDTORespuesta {

    private UUID idEvidencia;
    /** URL externa (legacy) o null si el archivo está almacenado en filesystem. */
    private String urlArchivo;
    /** Nombre original del archivo (solo para evidencias subidas por archivo). */
    private String nombreArchivo;
    /** MIME type del archivo (ej: image/jpeg). */
    private String tipoMime;
    /** Tamaño en bytes. */
    private Long tamanoBytes;
}
