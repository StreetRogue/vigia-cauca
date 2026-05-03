package unicauca.edu.co.micro_usuarios.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID idUsuario;

    @Column(unique = true)
    private String idIam;

    @Column(nullable = false, unique = true)
    private String cedula;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String telefono;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "id_municipio", nullable = false)
    private Long idMunicipio;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Rol rol;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EstadoUsuario estado;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaActualizacion;

    @Column(nullable = false, updatable = false)
    private String creadoPor;

    private String editadoPor;

    @PrePersist
    public void prePersist() {
        this.fechaCreacion = LocalDateTime.now();
        this.estado = EstadoUsuario.ACTIVO;
    }

    @PreUpdate
    public void preUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
}
