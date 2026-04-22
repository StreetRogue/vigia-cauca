package co.edu.unicauca.microreportes.capaAccesoDatos.repositories;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.VictimaSnapshotEntity;
import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VictimaSnapshotRepository extends JpaRepository<VictimaSnapshotEntity, UUID> {

    /**
     * Total de víctimas con filtros opcionales.
     * Aplica todos los filtros activos para que el total sea coherente con las distribuciones.
     */
    @Query("SELECT COUNT(v) FROM VictimaSnapshotEntity v " +
            "WHERE (:anio IS NULL OR v.anio = :anio) " +
            "AND (:mes IS NULL OR v.mes = :mes) " +
            "AND (:municipio IS NULL OR v.municipio = :municipio) " +
            "AND (:categoria IS NULL OR v.categoria = :categoria) " +
            "AND (:genero IS NULL OR v.genero = :genero) " +
            "AND (:grupoPoblacional IS NULL OR v.grupoPoblacional = :grupoPoblacional) " +
            "AND v.nivelVisibilidad IN :visibilidades " +
            "AND v.oculto = false")
    Long contarTotal(
            @Param("anio") Integer anio,
            @Param("mes") Integer mes,
            @Param("municipio") String municipio,
            @Param("categoria") CategoriaEvento categoria,
            @Param("genero") Genero genero,
            @Param("grupoPoblacional") GrupoPoblacional grupoPoblacional,
            @Param("visibilidades") List<NivelVisibilidad> visibilidades
    );

    /**
     * Distribución por género.
     * Aplica todos los filtros activos EXCEPTO genero (para mostrar el desglose completo).
     * Si se filtra por grupoPoblacional=INDIGENA, muestra el género de las víctimas indígenas.
     */
    @Query("SELECT v.genero, COUNT(v) FROM VictimaSnapshotEntity v " +
            "WHERE (:anio IS NULL OR v.anio = :anio) " +
            "AND (:mes IS NULL OR v.mes = :mes) " +
            "AND (:municipio IS NULL OR v.municipio = :municipio) " +
            "AND (:categoria IS NULL OR v.categoria = :categoria) " +
            "AND (:grupoPoblacional IS NULL OR v.grupoPoblacional = :grupoPoblacional) " +
            "AND v.nivelVisibilidad IN :visibilidades " +
            "AND v.oculto = false " +
            "GROUP BY v.genero ORDER BY COUNT(v) DESC")
    List<Object[]> distribucionPorGenero(
            @Param("anio") Integer anio,
            @Param("mes") Integer mes,
            @Param("municipio") String municipio,
            @Param("categoria") CategoriaEvento categoria,
            @Param("grupoPoblacional") GrupoPoblacional grupoPoblacional,
            @Param("visibilidades") List<NivelVisibilidad> visibilidades
    );

    /**
     * Distribución por rango de edad (rangos de 20 en 20 años).
     * Aplica todos los filtros activos EXCEPTO rangoEdad (para mostrar el desglose completo).
     */
    @Query("SELECT v.rangoEdad, COUNT(v) FROM VictimaSnapshotEntity v " +
            "WHERE (:anio IS NULL OR v.anio = :anio) " +
            "AND (:mes IS NULL OR v.mes = :mes) " +
            "AND (:municipio IS NULL OR v.municipio = :municipio) " +
            "AND (:categoria IS NULL OR v.categoria = :categoria) " +
            "AND (:genero IS NULL OR v.genero = :genero) " +
            "AND (:grupoPoblacional IS NULL OR v.grupoPoblacional = :grupoPoblacional) " +
            "AND v.nivelVisibilidad IN :visibilidades " +
            "AND v.oculto = false " +
            "GROUP BY v.rangoEdad ORDER BY v.rangoEdad")
    List<Object[]> distribucionPorRangoEdad(
            @Param("anio") Integer anio,
            @Param("mes") Integer mes,
            @Param("municipio") String municipio,
            @Param("categoria") CategoriaEvento categoria,
            @Param("genero") Genero genero,
            @Param("grupoPoblacional") GrupoPoblacional grupoPoblacional,
            @Param("visibilidades") List<NivelVisibilidad> visibilidades
    );

    /**
     * Distribución por grupo poblacional.
     * Aplica todos los filtros activos EXCEPTO grupoPoblacional (para mostrar el desglose completo).
     * Si se filtra por genero=FEMENINO, muestra los grupos poblacionales de las mujeres víctimas.
     */
    @Query("SELECT v.grupoPoblacional, COUNT(v) FROM VictimaSnapshotEntity v " +
            "WHERE (:anio IS NULL OR v.anio = :anio) " +
            "AND (:mes IS NULL OR v.mes = :mes) " +
            "AND (:municipio IS NULL OR v.municipio = :municipio) " +
            "AND (:categoria IS NULL OR v.categoria = :categoria) " +
            "AND (:genero IS NULL OR v.genero = :genero) " +
            "AND v.nivelVisibilidad IN :visibilidades " +
            "AND v.oculto = false " +
            "GROUP BY v.grupoPoblacional ORDER BY COUNT(v) DESC")
    List<Object[]> distribucionPorGrupoPoblacional(
            @Param("anio") Integer anio,
            @Param("mes") Integer mes,
            @Param("municipio") String municipio,
            @Param("categoria") CategoriaEvento categoria,
            @Param("genero") Genero genero,
            @Param("visibilidades") List<NivelVisibilidad> visibilidades
    );

    /** Elimina todas las víctimas asociadas a una novedad (para actualizaciones). */
    @Modifying
    @Query("DELETE FROM VictimaSnapshotEntity v WHERE v.novedadId = :novedadId")
    void deleteByNovedadId(@Param("novedadId") UUID novedadId);

    /** Oculta las víctimas de una novedad eliminada (soft delete). */
    @Modifying
    @Query("UPDATE VictimaSnapshotEntity v SET v.oculto = true WHERE v.novedadId = :novedadId")
    void ocultarByNovedadId(@Param("novedadId") UUID novedadId);
}
