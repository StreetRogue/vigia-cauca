package co.edu.unicauca.micronovedades.fachadaServices.DTO.peticion;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NovedadDTOPeticion {

    @NotNull(message = "El usuario_id es obligatorio")
    private UUID usuarioId;

    @NotNull(message = "La fecha del hecho es obligatoria")
    private LocalDate fechaHecho;

    @NotNull(message = "La hora de inicio es obligatoria")
    private LocalTime horaInicio;

    @NotNull(message = "La hora de fin es obligatoria")
    private LocalTime horaFin;

    @NotBlank(message = "El municipio es obligatorio")
    private String municipio;

    @NotBlank(message = "La localidad específica es obligatoria")
    private String localidadEspecifica;

    @NotNull(message = "La categoría es obligatoria")
    private CategoriaEvento categoria;

    @NotEmpty(message = "Debe indicarse al menos un actor")
    @Size(max = 10, message = "Se permiten máximo 10 actores")
    private List<Actor> actores;

    private String infraestructuraAfectada;

    private String accionInstitucional;

    @NotBlank(message = "La descripción del hecho es obligatoria")
    private String descripcionHecho;

    @NotNull(message = "El nivel de confianza es obligatorio")
    private NivelConfianza nivelConfianza;

    @NotNull(message = "El nivel de visibilidad es obligatorio")
    private NivelVisibilidad nivelVisibilidad;

    // Subentidades opcionales incluidas en la creación
    @Valid
    private List<VictimaDTOPeticion> victimas;

    @Valid
    private AfectacionHumanaDTOPeticion afectacionHumana;

    private List<String> urlsEvidencias;
}
