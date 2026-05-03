package unicauca.edu.co.micro_usuarios.Specifications;

import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;
import unicauca.edu.co.micro_usuarios.Entities.EstadoUsuario;
import unicauca.edu.co.micro_usuarios.Entities.Rol;
import unicauca.edu.co.micro_usuarios.Entities.Usuario;

public class UsuarioSpecification {

    public static Specification<Usuario> conRol(Rol rol) {
        return (root, query, cb) ->
                rol == null ? null : cb.equal(root.get("rol"), rol);
    }

    public static Specification<Usuario> conEstado(EstadoUsuario estado) {
        return (root, query, cb) ->
                estado == null ? null : cb.equal(root.get("estado"), estado);
    }

    public static Specification<Usuario> conMunicipio(Long idMunicipio) {
        return (root, query, cb) ->
                idMunicipio == null ? null :
                        cb.equal(root.get("municipio").get("idMunicipio"), idMunicipio);
    }

    public static Specification<Usuario> fetchMunicipio() {
        return (root, query, cb) -> {
            if (Usuario.class.equals(query.getResultType())) {
                root.fetch("municipio", JoinType.LEFT);
                query.distinct(true); // Para evitar duplicados
            }
            return null;
        };
    }
}
