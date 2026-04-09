package co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NovedadDTORespuesta {

    private UUID novedadId;
    private UUID usuarioId;
    private LocalDate fechaHecho;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private LocalDate fechaReporte;
    private LocalDateTime fechaActualizacion;
    private String municipio;
    private String localidadEspecifica;
    private CategoriaEvento categoria;
    private Actor actor1;
    private Actor actor2;
    private String infraestructuraAfectada;
    private String accionInstitucional;
    private String descripcionHecho;
    private NivelConfianza nivelConfianza;
    private NivelVisibilidad nivelVisibilidad;
    private String usuarioActualizacion;

    private List<VictimaDTORespuesta> victimas;
    private AfectacionHumanaDTORespuesta afectacionHumana;
    private List<EvidenciaDTORespuesta> evidencias;
}
