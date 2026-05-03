package unicauca.edu.co.micro_usuarios.Services.UsuarioService;

import unicauca.edu.co.micro_usuarios.DTOs.Request.UsuarioCreateDTO;
import unicauca.edu.co.micro_usuarios.DTOs.Request.UsuarioUpdateDTO;
import unicauca.edu.co.micro_usuarios.DTOs.Response.PageResponseDTO;
import unicauca.edu.co.micro_usuarios.DTOs.Response.UsuarioResponseDTO;

import java.util.UUID;

public interface UsuarioService {
    UsuarioResponseDTO registrarUsuario(UsuarioCreateDTO dto, String adminIdIam);
    UsuarioResponseDTO editarUsuario(UUID id, UsuarioUpdateDTO dto, String adminIdIam);
    UsuarioResponseDTO getUserById(UUID id);
    UsuarioResponseDTO getByIdIam(String adminIdIam);
    PageResponseDTO<UsuarioResponseDTO> listarUsuarios(String rol, String estado, Long idMunicipio, int page, int size);
}
