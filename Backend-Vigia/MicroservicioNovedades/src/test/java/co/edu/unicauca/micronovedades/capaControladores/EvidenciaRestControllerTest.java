package co.edu.unicauca.micronovedades.capaControladores;

import co.edu.unicauca.micronovedades.config.RabbitMQConfig;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta.EvidenciaDTORespuesta;
import co.edu.unicauca.micronovedades.fachadaServices.services.impl.EvidenciaStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = EvidenciaRestController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {RabbitMQConfig.class}
        )
)
@ActiveProfiles("test")
class EvidenciaRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EvidenciaStorageService evidenciaStorageService;

    private UUID novedadId;
    private UUID evidenciaId;
    private EvidenciaDTORespuesta respuestaEjemplo;

    private static final String BASE_URL = "/api/v1/microNovedades/novedades";

    @BeforeEach
    void setUp() {
        novedadId = UUID.randomUUID();
        evidenciaId = UUID.randomUUID();

        respuestaEjemplo = EvidenciaDTORespuesta.builder()
                .idEvidencia(evidenciaId)
                .nombreArchivo("foto_evidencia.jpg")
                .tipoMime("image/jpeg")
                .tamanoBytes(204800L)
                .build();
    }

    @Test
    void subirEvidencia_imagenJpg_retorna201() throws Exception {
        when(evidenciaStorageService.guardarEvidencia(eq(novedadId), any()))
                .thenReturn(respuestaEjemplo);

        MockMultipartFile archivo = new MockMultipartFile(
                "archivo", "foto_evidencia.jpg",
                "image/jpeg", "fake-image-bytes".getBytes());

        mockMvc.perform(multipart(BASE_URL + "/{novedadId}/evidencias", novedadId)
                        .file(archivo))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idEvidencia").value(evidenciaId.toString()))
                .andExpect(jsonPath("$.nombreArchivo").value("foto_evidencia.jpg"))
                .andExpect(jsonPath("$.tipoMime").value("image/jpeg"));

        verify(evidenciaStorageService).guardarEvidencia(eq(novedadId), any());
    }

    @Test
    void subirEvidencia_imagenPng_retorna201() throws Exception {
        EvidenciaDTORespuesta respuestaPng = EvidenciaDTORespuesta.builder()
                .idEvidencia(UUID.randomUUID())
                .nombreArchivo("captura.png")
                .tipoMime("image/png")
                .tamanoBytes(102400L)
                .build();

        when(evidenciaStorageService.guardarEvidencia(eq(novedadId), any()))
                .thenReturn(respuestaPng);

        MockMultipartFile archivo = new MockMultipartFile(
                "archivo", "captura.png",
                "image/png", "fake-png-bytes".getBytes());

        mockMvc.perform(multipart(BASE_URL + "/{novedadId}/evidencias", novedadId)
                        .file(archivo))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tipoMime").value("image/png"));
    }

    @Test
    void descargarEvidencia_evidenciaExistente_retornaBytes() throws Exception {
        byte[] imageBytes = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
        when(evidenciaStorageService.leerEvidencia(evidenciaId)).thenReturn(imageBytes);
        when(evidenciaStorageService.obtenerContentType(evidenciaId)).thenReturn("image/jpeg");

        mockMvc.perform(get(BASE_URL + "/evidencias/{id}", evidenciaId))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, "image/jpeg"))
                .andExpect(content().bytes(imageBytes));

        verify(evidenciaStorageService).leerEvidencia(evidenciaId);
        verify(evidenciaStorageService).obtenerContentType(evidenciaId);
    }

    @Test
    void descargarEvidencia_imagenPng_retornaBytesConContentTypePng() throws Exception {
        byte[] imageBytes = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47};
        when(evidenciaStorageService.leerEvidencia(evidenciaId)).thenReturn(imageBytes);
        when(evidenciaStorageService.obtenerContentType(evidenciaId)).thenReturn("image/png");

        mockMvc.perform(get(BASE_URL + "/evidencias/{id}", evidenciaId))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, "image/png"));
    }
}
