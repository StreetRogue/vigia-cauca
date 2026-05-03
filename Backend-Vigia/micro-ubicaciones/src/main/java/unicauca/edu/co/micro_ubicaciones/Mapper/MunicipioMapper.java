package unicauca.edu.co.micro_ubicaciones.Mapper;

import unicauca.edu.co.micro_ubicaciones.DTOs.Response.MunicipioResponseDTO;
import unicauca.edu.co.micro_ubicaciones.Entitys.Municipio;

public class MunicipioMapper {
    public static MunicipioResponseDTO toDTO (Municipio municipio) {
        return MunicipioResponseDTO.builder()
                .idMunicipio(municipio.getIdMunicipio())
                .nombre(municipio.getNombre())
                .build();
    }
}
