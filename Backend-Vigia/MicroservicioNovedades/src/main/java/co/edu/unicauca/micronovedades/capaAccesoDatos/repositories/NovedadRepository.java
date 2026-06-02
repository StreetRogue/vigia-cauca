package co.edu.unicauca.micronovedades.capaAccesoDatos.repositories;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.NovedadEntity;
import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.CategoriaEvento;
import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.NivelVisibilidad;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NovedadRepository extends JpaRepository<NovedadEntity, UUID> {

    @Override
    @EntityGraph(attributePaths = {"victimas", "afectacionHumana", "evidencias"})
    Optional<NovedadEntity> findById(UUID id);

    @EntityGraph(attributePaths = {"victimas", "afectacionHumana", "evidencias"})
    @Query("SELECT n FROM NovedadEntity n WHERE n.usuarioId = :usuarioId AND n.oculto = false")
    List<NovedadEntity> findByUsuarioId(@Param("usuarioId") UUID usuarioId);

    @EntityGraph(attributePaths = {"victimas", "afectacionHumana", "evidencias"})
    @Query("SELECT n FROM NovedadEntity n WHERE n.usuarioId = :usuarioId AND n.oculto = false")
    Page<NovedadEntity> findByUsuarioId(@Param("usuarioId") UUID usuarioId, Pageable pageable);

    // Filtrar por municipio (excluyendo ocultos)
    @Query("SELECT n FROM NovedadEntity n WHERE n.municipio = :municipio AND n.oculto = false")
    List<NovedadEntity> findByMunicipio(@Param("municipio") String municipio);

    // Filtrar por categoría (excluyendo ocultos)
    @Query("SELECT n FROM NovedadEntity n WHERE n.categoria = :categoria AND n.oculto = false")
    List<NovedadEntity> findByCategoria(@Param("categoria") CategoriaEvento categoria);

    // Filtrar por nivel de visibilidad (excluyendo ocultos)
    @Query("SELECT n FROM NovedadEntity n WHERE n.nivelVisibilidad = :nivelVisibilidad AND n.oculto = false")
    List<NovedadEntity> findByNivelVisibilidad(@Param("nivelVisibilidad") NivelVisibilidad nivelVisibilidad);

    // Override del findAll para excluir ocultos por defecto
    @Override
    @Query("SELECT n FROM NovedadEntity n WHERE n.oculto = false")
    List<NovedadEntity> findAll();

    // Override del findAll con paginación para excluir ocultos
    @Override
    @Query("SELECT n FROM NovedadEntity n WHERE n.oculto = false")
    Page<NovedadEntity> findAll(Pageable pageable);

    @Query("SELECT n FROM NovedadEntity n WHERE n.oculto = false")
    List<NovedadEntity> findAllVisible();

    @Query("SELECT n FROM NovedadEntity n WHERE n.usuarioId = :usuarioId AND n.oculto = false")
    List<NovedadEntity> findByUsuarioIdVisible(@Param("usuarioId") UUID usuarioId);

    // Get ALL records including hidden ones (for admin view with showOcultas=true)
    @Query("SELECT n FROM NovedadEntity n")
    @EntityGraph(attributePaths = {"victimas", "afectacionHumana", "evidencias"})
    List<NovedadEntity> findAllIncludingHidden();

    // Get ONLY hidden records (for admin view with showOcultas=true)
    @Query("SELECT n FROM NovedadEntity n WHERE n.oculto = true")
    @EntityGraph(attributePaths = {"victimas", "afectacionHumana", "evidencias"})
    List<NovedadEntity> findAllHidden();

    // Búsqueda de duplicados para carga masiva de Excel
    @Query("SELECT DISTINCT n FROM NovedadEntity n " +
            "LEFT JOIN FETCH n.actores " +
            "WHERE n.fechaHecho = :fechaHecho " +
            "AND n.horaInicio = :horaInicio " +
            "AND n.horaFin = :horaFin " +
            "AND UPPER(TRIM(n.municipio)) = UPPER(TRIM(:municipio)) " +
            "AND UPPER(TRIM(n.localidadEspecifica)) = UPPER(TRIM(:localidadEspecifica)) " +
            "AND n.categoria = :categoria " +
            "AND SIZE(n.actores) = :cantidadActores")
    List<NovedadEntity> buscarCandidatasDuplicadas(
            @Param("fechaHecho") LocalDate fechaHecho,
            @Param("horaInicio") LocalTime horaInicio,
            @Param("horaFin") LocalTime horaFin,
            @Param("municipio") String municipio,
            @Param("localidadEspecifica") String localidadEspecifica,
            @Param("categoria") CategoriaEvento categoria,
            @Param("cantidadActores") long cantidadActores
    );

    // Búsqueda avanzada para reportes con filtros opcionales (excluyendo ocultos)
    @Query("SELECT n FROM NovedadEntity n " +
            "WHERE n.fechaHecho BETWEEN :fechaInicio AND :fechaFin " +
            "AND n.oculto = false " +
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

    // Contar novedades por municipio (excluyendo ocultos)
    @Query("SELECT n.municipio, COUNT(n) FROM NovedadEntity n " +
            "WHERE n.fechaHecho BETWEEN :fechaInicio AND :fechaFin " +
            "AND n.oculto = false " +
            "GROUP BY n.municipio")
    List<Object[]> contarPorMunicipio(
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin
    );
}
