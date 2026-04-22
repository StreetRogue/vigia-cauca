package unicauca.edu.co.micro_usuarios.Services.UsuarioService;

import unicauca.edu.co.micro_usuarios.DTOs.Request.UsuarioCreateDTO;
import unicauca.edu.co.micro_usuarios.DTOs.Request.UsuarioUpdateDTO;
import unicauca.edu.co.micro_usuarios.DTOs.Response.PageResponseDTO;
import unicauca.edu.co.micro_usuarios.DTOs.Response.UsuarioResponseDTO;

import java.util.UUID;

public interface UsuarioService {
    UsuarioResponseDTO registrarUsuario(UsuarioCreateDTO dto, String adminAuth0Id);
    UsuarioResponseDTO editarUsuario(UUID id, UsuarioUpdateDTO dto, String adminAuth0Id);
    UsuarioResponseDTO getUserById(UUID id);
    UsuarioResponseDTO getByAuth0Id(String adminAuth0Id);
    PageResponseDTO<UsuarioResponseDTO> listarUsuarios(String rol, String estado, Long idMunicipio, int page, int size);
}
