package co.edu.unicauca.microreportes.fachadaServices.services;

import co.edu.unicauca.microreportes.capaAccesoDatos.models.enums.NivelVisibilidad;
import co.edu.unicauca.microreportes.fachadaServices.mapper.VisibilidadHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class VisibilidadHelperTest {

    private VisibilidadHelper helper;

    @BeforeEach
    void setUp() { helper = new VisibilidadHelper(); }

    @Test @DisplayName("HU-5.3/1.7: visitante (null) solo ve PUBLICA")
    void visibilidadesPorRol_null() {
        List<NivelVisibilidad> v = helper.visibilidadesPorRol(null);
        assertEquals(1, v.size());
        assertTrue(v.contains(NivelVisibilidad.PUBLICA));
    }

    @Test @DisplayName("HU-5.3/1.7: visitante explicito solo ve PUBLICA")
    void visibilidadesPorRol_visitante() {
        List<NivelVisibilidad> v = helper.visibilidadesPorRol("VISITANTE");
        assertEquals(1, v.size());
        assertTrue(v.contains(NivelVisibilidad.PUBLICA));
    }

    @Test @DisplayName("HU-5.1: ADMIN ve PUBLICA + PRIVADA")
    void visibilidadesPorRol_admin() {
        List<NivelVisibilidad> v = helper.visibilidadesPorRol("ADMIN");
        assertEquals(2, v.size());
        assertTrue(v.contains(NivelVisibilidad.PUBLICA));
        assertTrue(v.contains(NivelVisibilidad.PRIVADA));
    }

    @Test @DisplayName("HU-5.1: OPERADOR ve PUBLICA + PRIVADA")
    void visibilidadesPorRol_operador() {
        List<NivelVisibilidad> v = helper.visibilidadesPorRol("OPERADOR");
        assertEquals(2, v.size());
    }

    @Test @DisplayName("HU-5.3: tieneAccesoPrivado = false para visitante")
    void tieneAccesoPrivado_visitante() {
        assertFalse(helper.tieneAccesoPrivado(null));
        assertFalse(helper.tieneAccesoPrivado("VISITANTE"));
    }

    @Test @DisplayName("HU-5.1: tieneAccesoPrivado = true para ADMIN y OPERADOR")
    void tieneAccesoPrivado_autenticado() {
        assertTrue(helper.tieneAccesoPrivado("ADMIN"));
        assertTrue(helper.tieneAccesoPrivado("OPERADOR"));
    }

    @Test @DisplayName("HU-5.1: rol en minusculas se normaliza (admin -> PUBLICA+PRIVADA)")
    void visibilidadesPorRol_caseInsensitive() {
        List<NivelVisibilidad> v = helper.visibilidadesPorRol("admin");
        assertEquals(2, v.size());
    }
}
