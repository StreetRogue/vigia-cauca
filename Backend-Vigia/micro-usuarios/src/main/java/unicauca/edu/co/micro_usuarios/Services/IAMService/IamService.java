package unicauca.edu.co.micro_usuarios.Services.IAMService;

import unicauca.edu.co.micro_usuarios.DTOs.Request.UsuarioUpdateDTO;
import unicauca.edu.co.micro_usuarios.Entities.Rol;

public interface IamService {
    String crearUsuario(String email, String username, Rol rol);
    void actualizarUsuario(String userId, UsuarioUpdateDTO dto);
    void bloquearUsuario(String userId);
    void desbloquearUsuario(String userId);
}
