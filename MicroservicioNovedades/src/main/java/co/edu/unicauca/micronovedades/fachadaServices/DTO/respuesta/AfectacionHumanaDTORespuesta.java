package co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.ReclutamientoMenoresFlag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AfectacionHumanaDTORespuesta {

    private UUID idAfectacion;
    private Integer muertosTotales;
    private Integer muertosCiviles;
    private Integer muertosFuerzaPublica;
    private Integer muertosIlegales;
    private Integer heridosTotales;
    private Integer heridosCiviles;
    private Integer heridosFuerzaPublica;
    private Integer desplazadosTotales;
    private Integer confinadosTotales;
    private Boolean afectacionCivilesFlag;
    private ReclutamientoMenoresFlag reclutamientoMenoresFlag;
}
