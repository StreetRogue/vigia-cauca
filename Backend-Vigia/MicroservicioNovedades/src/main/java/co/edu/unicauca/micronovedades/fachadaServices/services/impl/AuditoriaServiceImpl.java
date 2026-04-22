package co.edu.unicauca.micronovedades.fachadaServices.services.impl;

import co.edu.unicauca.micronovedades.capaAccesoDatos.models.AuditoriaNovedadEntity;
import co.edu.unicauca.micronovedades.capaAccesoDatos.repositories.AuditoriaNovedadRepository;
import co.edu.unicauca.micronovedades.fachadaServices.DTO.respuesta.AuditoriaNovedadDTORespuesta;
import co.edu.unicauca.micronovedades.fachadaServices.mapper.NovedadMapper;
import co.edu.unicauca.micronovedades.fachadaServices.services.IAuditoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditoriaServiceImpl implements IAuditoriaService {

    private final AuditoriaNovedadRepository auditoriaRepository;
    private final NovedadMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<AuditoriaNovedadDTORespuesta> obtenerHistorialNovedad(UUID novedadId) {
        List<AuditoriaNovedadEntity> historial = auditoriaRepository
                .findByNovedad_NovedadIdOrderByFechaDesc(novedadId);
        return mapper.toAuditoriaDTOList(historial);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditoriaNovedadDTORespuesta> obtenerHistorialPorUsuario(UUID usuarioId) {
        List<AuditoriaNovedadEntity> historial = auditoriaRepository
                .findByUsuarioIdOrderByFechaDesc(usuarioId);
        return mapper.toAuditoriaDTOList(historial);
    }
}
