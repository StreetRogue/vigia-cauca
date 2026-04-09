package co.edu.unicauca.micronovedades.capaAccesoDatos.repositories;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.NovedadEntity;
import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.CategoriaEvento;
import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.NivelVisibilidad;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NovedadRepository extends JpaRepository<NovedadEntity, UUID> {

    @Override
    @EntityGraph(attributePaths = {"victimas", "afectacionHumana", "evidencias"})
    Optional<NovedadEntity> findById(UUID id);

    @EntityGraph(attributePaths = {"victimas", "afectacionHumana", "evidencias"})
    List<NovedadEntity> findByUsuarioId(UUID usuarioId);

    // Filtrar por municipio
    List<NovedadEntity> findByMunicipio(String municipio);

    // Filtrar por categoría
    List<NovedadEntity> findByCategoria(CategoriaEvento categoria);

    // Filtrar por nivel de visibilidad
    List<NovedadEntity> findByNivelVisibilidad(NivelVisibilidad nivelVisibilidad);

    // Búsqueda avanzada para reportes con filtros opcionales
    @Query("SELECT n FROM NovedadEntity n " +
            "WHERE n.fechaHecho BETWEEN :fechaInicio AND :fechaFin " +
            "AND (:municipio IS NULL OR n.municipio = :municipio) " +
            "AND (:categoria IS NULL OR n.categoria = :categoria) " +
            "AND (:nivelVisibilidad IS NULL OR n.nivelVisibilidad = :nivelVisibilidad)")
    List<NovedadEntity> buscarConFiltros(
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin,
            @Param("municipio") String municipio,
            @Param("categoria") CategoriaEvento categoria,
            @Param("nivelVisibilidad") NivelVisibilidad nivelVisibilidad
    );

    // Contar novedades por municipio (útil para dashboards)
    @Query("SELECT n.municipio, COUNT(n) FROM NovedadEntity n " +
            "WHERE n.fechaHecho BETWEEN :fechaInicio AND :fechaFin " +
            "GROUP BY n.municipio")
    List<Object[]> contarPorMunicipio(
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin
    );
}
