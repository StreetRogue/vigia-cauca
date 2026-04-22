package co.edu.unicauca.micronovedades.capaAccesoDatos.models;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.enums.AccionAuditoria;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "AUDITORIA_NOVEDADES")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuditoriaNovedadEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "auditoria_id")
    private UUID auditoriaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "novedad_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private NovedadEntity novedad;

    // Cédula del usuario que realizó la acción
    @Column(name = "usuario_id", nullable = false)
    private UUID usuarioId;

    @Enumerated(EnumType.STRING)
    @Column(name = "accion", nullable = false)
    private AccionAuditoria accion;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "datos_anteriores", columnDefinition = "jsonb")
    private String datosAnteriores;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "datos_nuevos", columnDefinition = "jsonb")
    private String datosNuevos;

    @Column(name = "cambios", columnDefinition = "TEXT")
    private String cambios;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;

    @PrePersist
    public void prePersist() {
        this.fecha = LocalDateTime.now();
    }
}
