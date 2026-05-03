package co.edu.unicauca.microreportes.fachadaServices.DTO.peticion;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.*;
import lombok.*;

import java.util.LinkedHashMap;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FiltroEstadisticaDTO {

    // Filtros de eventos (compartidos entre estadísticas de novedades y víctimas)
    private Integer anio;
    private Integer mes;
    private String municipio;
    private CategoriaEvento categoria;
    private Actor actor;
    private NivelConfianza nivelConfianza;

    // Filtros demográficos de víctimas (alineados con VictimaEntity de MicroservicioNovedades)
    private Genero genero;
    private GrupoPoblacional grupoPoblacional;

    /**
     * Construye un mapa con solo los filtros que fueron suministrados.
     * Se incluye en la respuesta JSON como "filtrosAplicados".
     */
    public Map<String, String> comoMapa() {
        Map<String, String> mapa = new LinkedHashMap<>();
        if (anio != null)             mapa.put("anio", String.valueOf(anio));
        if (mes != null)              mapa.put("mes", String.valueOf(mes));
        if (municipio != null)        mapa.put("municipio", municipio);
        if (categoria != null)        mapa.put("categoria", categoria.name());
        if (actor != null)            mapa.put("actor", actor.name());
        if (nivelConfianza != null)   mapa.put("nivelConfianza", nivelConfianza.name());
        if (genero != null)           mapa.put("genero", genero.name());
        if (grupoPoblacional != null) mapa.put("grupoPoblacional", grupoPoblacional.name());
        return mapa;
    }
}
