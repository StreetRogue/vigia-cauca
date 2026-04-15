package co.edu.unicauca.microreportes.capaAccesoDatos.repositories;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.NovedadSnapshotEntity;
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
     * Serie temporal mensual para gráficos de línea/barra.
     */
    @Query("SELECT n.mes, COUNT(n), " +
            "COALESCE(SUM(n.muertosTotales),0), " +
            "COALESCE(SUM(n.heridosTotales),0) " +
            "FROM NovedadSnapshotEntity n " +
            "WHERE n.anio = :anio " +
            "AND (:categoria IS NULL OR n.categoria = :categoria) " +
            "AND (:municipio IS NULL OR n.municipio = :municipio) " +
            "AND n.nivelVisibilidad IN :visibilidades " +
            "GROUP BY n.mes ORDER BY n.mes")
    List<Object[]> serieTemporal(
            @Param("anio") int anio,
            @Param("categoria") CategoriaEvento categoria,
            @Param("municipio") String municipio,
            @Param("visibilidades") List<NivelVisibilidad> visibilidades
    );

    /**
     * Conteo por actor para gráfico de barras.
     */
    @Query("SELECT n.actor1, COUNT(n) FROM NovedadSnapshotEntity n " +
            "WHERE n.anio = :anio " +
            "AND (:municipio IS NULL OR n.municipio = :municipio) " +
            "AND n.nivelVisibilidad IN :visibilidades " +
            "GROUP BY n.actor1 ORDER BY COUNT(n) DESC")
    List<Object[]> contarPorActor(
            @Param("anio") int anio,
            @Param("municipio") String municipio,
            @Param("visibilidades") List<NivelVisibilidad> visibilidades
    );

    /**
     * Mapa de calor: conteo por municipio.
     */
    @Query("SELECT n.municipio, COUNT(n), " +
            "COALESCE(SUM(n.muertosTotales),0), " +
            "COALESCE(SUM(n.heridosTotales),0), " +
            "COALESCE(SUM(n.desplazadosTotales),0) " +
            "FROM NovedadSnapshotEntity n " +
            "WHERE n.anio = :anio " +
            "AND n.nivelVisibilidad IN :visibilidades " +
            "GROUP BY n.municipio ORDER BY COUNT(n) DESC")
    List<Object[]> mapaCalorMunicipios(
            @Param("anio") int anio,
            @Param("visibilidades") List<NivelVisibilidad> visibilidades
    );
}