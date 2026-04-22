package unicauca.edu.co.micro_ubicaciones.Services;

import unicauca.edu.co.micro_ubicaciones.DTOs.Response.MunicipioResponseDTO;

import java.util.List;

public interface MunicipioService {
    MunicipioResponseDTO getById(Long id);
    List<MunicipioResponseDTO> getAll();
    List<MunicipioResponseDTO> getByIds(List<Long> ids);
}
