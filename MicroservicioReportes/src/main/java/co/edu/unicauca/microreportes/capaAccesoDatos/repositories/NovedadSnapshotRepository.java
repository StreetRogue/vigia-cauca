package co.edu.unicauca.microreportes.capaAccesoDatos.repositories;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.NovedadSnapshotEntity;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.Actor;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.CategoriaEvento;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.NivelVisibilidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NovedadSnapshotRepository extends JpaRepository<NovedadSnapshotEntity, UUID>,
        JpaSpecificationExecutor<NovedadSnapshotEntity> {

    /**
     * Serie temporal agrupada por año y mes.
     *
     * Todos los filtros son opcionales: null = sin restricción.
     * Cuando anio es null se devuelven todos los años disponibles.
     * El actor filtra tanto actor1 como actor2.
     */
    @Query("SELECT n.anio, n.mes, COUNT(n), " +
            "COALESCE(SUM(n.muertosTotales),0), " +
            "COALESCE(SUM(n.heridosTotales),0), " +
            "COALESCE(SUM(n.desplazadosTotales),0) " +
            "FROM NovedadSnapshotEntity n " +
            "WHERE (:anio IS NULL OR n.anio = :anio) " +
            "AND (:mes IS NULL OR n.mes = :mes) " +
            "AND (:categoria IS NULL OR n.categoria = :categoria) " +
            "AND (:municipio IS NULL OR n.municipio = :municipio) " +
            "AND (:actor IS NULL OR n.actor1 = :actor OR n.actor2 = :actor) " +
            "AND n.nivelVisibilidad IN :visibilidades " +
            "AND n.oculto = false " +
            "GROUP BY n.anio, n.mes ORDER BY n.anio, n.mes")
    List<Object[]> serieTemporal(
            @Param("anio") Integer anio,
            @Param("mes") Integer mes,
            @Param("categoria") CategoriaEvento categoria,
            @Param("municipio") String municipio,
            @Param("actor") Actor actor,
            @Param("visibilidades") List<NivelVisibilidad> visibilidades
    );

    /**
     * Conteo por actor principal para gráfico de barras.
     *
     * Todos los filtros son opcionales: null = sin restricción.
     */
    @Query("SELECT n.actor1, COUNT(n) FROM NovedadSnapshotEntity n " +
            "WHERE (:anio IS NULL OR n.anio = :anio) " +
            "AND (:mes IS NULL OR n.mes = :mes) " +
            "AND (:municipio IS NULL OR n.municipio = :municipio) " +
            "AND (:categoria IS NULL OR n.categoria = :categoria) " +
            "AND n.nivelVisibilidad IN :visibilidades " +
            "AND n.oculto = false " +
            "GROUP BY n.actor1 ORDER BY COUNT(n) DESC")
    List<Object[]> contarPorActor(
            @Param("anio") Integer anio,
            @Param("mes") Integer mes,
            @Param("municipio") String municipio,
            @Param("categoria") CategoriaEvento categoria,
            @Param("visibilidades") List<NivelVisibilidad> visibilidades
    );

    /**
     * Mapa de calor: conteo e impacto por municipio.
     *
     * Todos los filtros son opcionales: null = sin restricción.
     */
    @Query("SELECT n.municipio, COUNT(n), " +
            "COALESCE(SUM(n.muertosTotales),0), " +
            "COALESCE(SUM(n.heridosTotales),0), " +
            "COALESCE(SUM(n.desplazadosTotales),0) " +
            "FROM NovedadSnapshotEntity n " +
            "WHERE (:anio IS NULL OR n.anio = :anio) " +
            "AND (:mes IS NULL OR n.mes = :mes) " +
            "AND (:categoria IS NULL OR n.categoria = :categoria) " +
            "AND n.nivelVisibilidad IN :visibilidades " +
            "AND n.oculto = false " +
            "GROUP BY n.municipio ORDER BY COUNT(n) DESC")
    List<Object[]> mapaCalorMunicipios(
            @Param("anio") Integer anio,
            @Param("mes") Integer mes,
            @Param("categoria") CategoriaEvento categoria,
            @Param("visibilidades") List<NivelVisibilidad> visibilidades
    );
}
