package co.edu.unicauca.microreportes.fachadaServices.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class SseServiceTest {

    private SseService service;

    @BeforeEach
    void setUp() {
        service = new SseService();
    }

    @Test @DisplayName("HU-5.4: suscribir crea emitter y cuenta como conexion activa")
    void suscribir_creaConexion() {
        assertEquals(0, service.conexionesActivas());
        SseEmitter emitter = service.suscribir("dashboard");
        assertNotNull(emitter);
        assertEquals(1, service.conexionesActivas());
    }

    @Test @DisplayName("HU-5.4: multiples suscripciones al mismo canal se acumulan")
    void suscribir_multiplesMismoCanal() {
        service.suscribir("dashboard");
        service.suscribir("dashboard");
        service.suscribir("dashboard");
        assertEquals(3, service.conexionesActivas());
    }

    @Test @DisplayName("HU-5.4: suscripciones a canales distintos se cuentan por separado")
    void suscribir_canalesDistintos() {
        service.suscribir("dashboard");
        service.suscribir("dashboard:Popayan");
        service.suscribir("alertas");
        assertEquals(3, service.conexionesActivas());
    }

    @Test @DisplayName("HU-5.4: emitir a canal sin suscriptores no lanza excepcion")
    void emitir_sinSuscriptores() {
        assertDoesNotThrow(() -> service.emitir("vacio", "test", "data"));
    }

    @Test @DisplayName("HU-5.4: emitirATodos envia a todos los canales existentes")
    void emitirATodos_noLanzaExcepcion() {
        service.suscribir("dashboard");
        service.suscribir("alertas");
        assertDoesNotThrow(() -> service.emitirATodos("refresh", Map.of("ok", true)));
    }

    @Test @DisplayName("HU-5.4: conexionesActivas devuelve 0 sin suscriptores")
    void conexionesActivas_vacio() {
        assertEquals(0, service.conexionesActivas());
    }

    @Test @DisplayName("HU-5.4: canal personalizado funciona igual que dashboard")
    void suscribir_canalPersonalizado() {
        SseEmitter e = service.suscribir("dashboard:Piendamo");
        assertNotNull(e);
        assertEquals(1, service.conexionesActivas());
    }
}
