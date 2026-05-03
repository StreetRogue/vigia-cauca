package unicauca.edu.co.micro_ubicaciones.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import unicauca.edu.co.micro_ubicaciones.DTOs.Response.MunicipioResponseDTO;
import unicauca.edu.co.micro_ubicaciones.Entitys.Municipio;
import unicauca.edu.co.micro_ubicaciones.Mapper.MunicipioMapper;
import unicauca.edu.co.micro_ubicaciones.Repository.MunicipioRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MunicipioServiceImpl implements MunicipioService {
    private final MunicipioRepository municipioRepository;

    @Override
    public MunicipioResponseDTO getById(Long id) {
        Municipio municipio = municipioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Municipio no encontrado"));
        return MunicipioMapper.toDTO(municipio);
    }

    @Override
    public List<MunicipioResponseDTO> getAll() {
        List<Municipio> municipios = municipioRepository.findAll();
        return municipios.stream().map(MunicipioMapper::toDTO).toList();
    }

    @Override
    public List<MunicipioResponseDTO> getByIds(List<Long> ids) {
        List<Municipio> municipios = municipioRepository.findAllById(ids);
        return municipios.stream().map(MunicipioMapper::toDTO).toList();
    }

}
