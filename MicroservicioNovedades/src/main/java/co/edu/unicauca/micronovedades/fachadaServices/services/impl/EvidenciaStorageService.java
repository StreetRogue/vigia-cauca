package co.edu.unicauca.micronovedades.fachadaServices.services.impl;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.EvidenciaEntity;
import co.edu.unicauca.micronovedades.capaAccesoDatos.models.NovedadEntity;
import co.edu.unicauca.micronovedades.capaAccesoDatos.repositories.EvidenciaRepository;
import co.edu.unicauca.micronovedades.capaAccesoDatos.repositories.NovedadRepository;
import co.edu.unicauca.micronovedades.capaControladores.controladorExcepciones.BadRequestException;
import co.edu.unicauca.micronovedades.capaControladores.controladorExcepciones.ResourceNotFoundException;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta.EvidenciaDTORespuesta;
import co.edu.unicauca.micronovedades.fachadaServices.mapper.NovedadMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EvidenciaStorageService {

    private static final long MAX_TAMANO_BYTES = 5 * 1024 * 1024L; // 5 MB
    private static final Set<String> EXTENSIONES_PERMITIDAS = Set.of("jpg", "jpeg", "png");
    private static final Map<String, String> MIME_POR_EXTENSION = Map.of(
            "jpg",  "image/jpeg",
            "jpeg", "image/jpeg",
            "png",  "image/png"
    );

    @Value("${evidencias.storage.path:./uploads/evidencias}")
    private String storagePath;

    private final EvidenciaRepository evidenciaRepository;
    private final NovedadRepository novedadRepository;
    private final NovedadMapper mapper;

    /** Crea el directorio de almacenamiento al arrancar si no existe. */
    @PostConstruct
    public void inicializarDirectorio() {
        try {
            Path dir = Paths.get(storagePath).toAbsolutePath().normalize();
            Files.createDirectories(dir);
            log.info("Directorio de evidencias listo: {}", dir);
        } catch (IOException e) {
            log.error("No se pudo crear el directorio de evidencias '{}': {}", storagePath, e.getMessage());
        }
    }

    /**
     * Valida, guarda el archivo en disco y persiste la referencia en BD.
     *
     * @param novedadId UUID de la novedad a la que pertenece la evidencia
     * @param archivo   archivo recibido desde el endpoint multipart
     * @return DTO con los metadatos de la evidencia guardada
     */
    public EvidenciaDTORespuesta guardarEvidencia(UUID novedadId, MultipartFile archivo) {
        NovedadEntity novedad = novedadRepository.findById(novedadId)
                .orElseThrow(() -> new ResourceNotFoundException("Novedad", novedadId));

        validarArchivo(archivo);

        String extension = obtenerExtension(archivo.getOriginalFilename());
        String nombreUnico = UUID.randomUUID() + "." + extension;
        Path destino = Paths.get(storagePath).toAbsolutePath().normalize().resolve(nombreUnico);

        // Protección path traversal: el archivo destino debe estar dentro de storagePath
        Path base = Paths.get(storagePath).toAbsolutePath().normalize();
        if (!destino.startsWith(base)) {
            throw new BadRequestException("Ruta de destino inválida");
        }

        try {
            Files.copy(archivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);
            log.info("Evidencia guardada en: {}", destino);
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar el archivo en disco: " + e.getMessage(), e);
        }

        EvidenciaEntity evidencia = EvidenciaEntity.builder()
                .novedad(novedad)
                .urlArchivo("")   // vacío: la columna tiene NOT NULL en DB; el archivo real está en rutaArchivo
                .nombreArchivo(archivo.getOriginalFilename())
                .rutaArchivo(destino.toString())
                .tipoMime(MIME_POR_EXTENSION.getOrDefault(extension, "application/octet-stream"))
                .tamanoBytes(archivo.getSize())
                .build();

        novedad.agregarEvidencia(evidencia);
        EvidenciaEntity guardada = evidenciaRepository.save(evidencia);

        return mapper.toEvidenciaDTO(guardada);
    }

    /**
     * Lee el archivo desde el filesystem y lo retorna como bytes.
     *
     * @param idEvidencia UUID de la evidencia
     * @return arreglo de bytes del archivo
     */
    public byte[] leerEvidencia(UUID idEvidencia) {
        EvidenciaEntity evidencia = evidenciaRepository.findById(idEvidencia)
                .orElseThrow(() -> new ResourceNotFoundException("Evidencia", idEvidencia));

        if (evidencia.getRutaArchivo() == null) {
            throw new BadRequestException("Esta evidencia no tiene archivo en filesystem (es una URL externa)");
        }

        Path ruta = Paths.get(evidencia.getRutaArchivo()).normalize();

        // Protección path traversal al leer
        Path base = Paths.get(storagePath).toAbsolutePath().normalize();
        if (!ruta.toAbsolutePath().startsWith(base)) {
            throw new BadRequestException("Ruta de archivo inválida");
        }

        try {
            return Files.readAllBytes(ruta);
        } catch (IOException e) {
            throw new RuntimeException("No se pudo leer el archivo de evidencia: " + e.getMessage(), e);
        }
    }

    /**
     * Retorna el Content-Type para servir la imagen correctamente.
     */
    public String obtenerContentType(UUID idEvidencia) {
        return evidenciaRepository.findById(idEvidencia)
                .map(e -> e.getTipoMime() != null ? e.getTipoMime() : "application/octet-stream")
                .orElse("application/octet-stream");
    }

    // ==========================================
    // PRIVADOS
    // ==========================================

    private void validarArchivo(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new BadRequestException("El archivo no puede estar vacío");
        }

        if (archivo.getSize() > MAX_TAMANO_BYTES) {
            throw new BadRequestException("El archivo supera el tamaño máximo permitido de 5 MB");
        }

        String extension = obtenerExtension(archivo.getOriginalFilename());
        if (!EXTENSIONES_PERMITIDAS.contains(extension)) {
            throw new BadRequestException(
                    "Tipo de archivo no permitido. Se aceptan: " + String.join(", ", EXTENSIONES_PERMITIDAS));
        }
    }

    private String obtenerExtension(String nombreArchivo) {
        if (nombreArchivo == null || !nombreArchivo.contains(".")) {
            throw new BadRequestException("El archivo debe tener extensión (jpg, jpeg o png)");
        }
        return nombreArchivo.substring(nombreArchivo.lastIndexOf('.') + 1).toLowerCase();
    }
}
