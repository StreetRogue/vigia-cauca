package unicauca.edu.co.micro_usuarios.Specifications;

import jakarta.persistence.criteria.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.domain.Specification;
import unicauca.edu.co.micro_usuarios.Entities.EstadoUsuario;
import unicauca.edu.co.micro_usuarios.Entities.Rol;
import unicauca.edu.co.micro_usuarios.Entities.Usuario;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UsuarioSpecificationTest {

    @SuppressWarnings("unchecked")
    private Root<Usuario> mockRoot() { return mock(Root.class); }
    @SuppressWarnings("unchecked")
    private CriteriaQuery<?> mockQuery() { return mock(CriteriaQuery.class); }
    private CriteriaBuilder mockCb() { return mock(CriteriaBuilder.class); }

    @Test @DisplayName("HU-4.2: conRol null retorna predicado null (sin filtro)")
    void conRol_null() {
        Specification<Usuario> spec = UsuarioSpecification.conRol(null);
        assertNull(spec.toPredicate(mockRoot(), mockQuery(), mockCb()));
    }

    @Test @DisplayName("HU-4.2: conRol ADMIN construye predicado equal")
    void conRol_admin() {
        Root<Usuario> root = mockRoot();
        CriteriaBuilder cb = mockCb();
        Path<Object> path = mock(Path.class);
        Predicate pred = mock(Predicate.class);
        when(root.get("rol")).thenReturn(path);
        when(cb.equal(path, Rol.ADMIN)).thenReturn(pred);

        Predicate result = UsuarioSpecification.conRol(Rol.ADMIN).toPredicate(root, mockQuery(), cb);
        assertEquals(pred, result);
    }

    @Test @DisplayName("HU-4.2: conEstado null retorna predicado null")
    void conEstado_null() {
        Specification<Usuario> spec = UsuarioSpecification.conEstado(null);
        assertNull(spec.toPredicate(mockRoot(), mockQuery(), mockCb()));
    }

    @Test @DisplayName("HU-4.2: conEstado ACTIVO construye predicado equal")
    void conEstado_activo() {
        Root<Usuario> root = mockRoot();
        CriteriaBuilder cb = mockCb();
        Path<Object> path = mock(Path.class);
        Predicate pred = mock(Predicate.class);
        when(root.get("estado")).thenReturn(path);
        when(cb.equal(path, EstadoUsuario.ACTIVO)).thenReturn(pred);

        Predicate result = UsuarioSpecification.conEstado(EstadoUsuario.ACTIVO).toPredicate(root, mockQuery(), cb);
        assertEquals(pred, result);
    }

    @Test @DisplayName("HU-4.2: conMunicipio null retorna predicado null")
    void conMunicipio_null() {
        assertNull(UsuarioSpecification.conMunicipio(null).toPredicate(mockRoot(), mockQuery(), mockCb()));
    }

    @Test @DisplayName("HU-4.2: conMunicipio con valor construye predicado anidado")
    void conMunicipio_conValor() {
        Root<Usuario> root = mockRoot();
        CriteriaBuilder cb = mockCb();
        Path<Object> munPath = mock(Path.class);
        Path<Object> idPath = mock(Path.class);
        Predicate pred = mock(Predicate.class);
        when(root.get("municipio")).thenReturn(munPath);
        when(munPath.get("idMunicipio")).thenReturn(idPath);
        when(cb.equal(idPath, 19001L)).thenReturn(pred);

        Predicate result = UsuarioSpecification.conMunicipio(19001L).toPredicate(root, mockQuery(), cb);
        assertEquals(pred, result);
    }
}
