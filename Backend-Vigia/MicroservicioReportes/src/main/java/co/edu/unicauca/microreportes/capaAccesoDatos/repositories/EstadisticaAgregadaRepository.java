package co.edu.unicauca.microreportes.capaAccesoDatos.repositories;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.EstadisticaAgregadaEntity;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.CategoriaEvento;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.NivelVisibilidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EstadisticaAgregadaRepository extends JpaRepository<EstadisticaAgregadaEntity, UUID> {

    Optional<EstadisticaAgregadaEntity> findByAnioAndMesAndMunicipioAndCategoriaAndNivelVisibilidad(
            Integer anio, Integer mes, String municipio,
            CategoriaEvento categoria, NivelVisibilidad nivelVisibilidad
    );

    /**
     * KPIs globales del resumen (cards del dashboard).
     *
     * Todos los filtros son opcionales: null = sin restricción.
     * Cuando anio es null se agregan todos los años disponibles.
     */
    @Query("SELECT " +
            "COALESCE(SUM(e.totalEventos),0), " +
            "COALESCE(SUM(e.totalMuertos),0), " +
            "COALESCE(SUM(e.totalHeridos),0), " +
            "COALESCE(SUM(e.totalDesplazados),0), " +
            "COALESCE(SUM(e.totalConfinados),0) " +
            "FROM EstadisticaAgregadaEntity e " +
            "WHERE (:anio IS NULL OR e.anio = :anio) " +
            "AND (:mes IS NULL OR e.mes = :mes) " +
            "AND (:municipio IS NULL OR e.municipio = :municipio) " +
            "AND (:categoria IS NULL OR e.categoria = :categoria) " +
            "AND e.nivelVisibilidad IN :visibilidades")
    List<Object[]> obtenerKPIs(
            @Param("anio") Integer anio,
            @Param("mes") Integer mes,
            @Param("municipio") String municipio,
            @Param("categoria") CategoriaEvento categoria,
            @Param("visibilidades") List<NivelVisibilidad> visibilidades
    );

    /**
     * Desglose por categoría para gráficos.
     *
     * Todos los filtros son opcionales: null = sin restricción.
     */
    @Query("SELECT e.categoria, " +
            "SUM(e.totalEventos), SUM(e.totalMuertos), SUM(e.totalHeridos) " +
            "FROM EstadisticaAgregadaEntity e " +
            "WHERE (:anio IS NULL OR e.anio = :anio) " +
            "AND (:mes IS NULL OR e.mes = :mes) " +
            "AND (:municipio IS NULL OR e.municipio = :municipio) " +
            "AND e.nivelVisibilidad IN :visibilidades " +
            "GROUP BY e.categoria ORDER BY SUM(e.totalEventos) DESC")
    List<Object[]> desglosePorCategoria(
            @Param("anio") Integer anio,
            @Param("mes") Integer mes,
            @Param("municipio") String municipio,
            @Param("visibilidades") List<NivelVisibilidad> visibilidades
    );

    List<EstadisticaAgregadaEntity> findByAnioAndNivelVisibilidadIn(
            Integer anio, List<NivelVisibilidad> visibilidades
    );
}
