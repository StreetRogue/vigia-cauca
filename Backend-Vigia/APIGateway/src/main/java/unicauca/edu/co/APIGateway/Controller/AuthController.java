
package unicauca.edu.co.APIGateway.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
import unicauca.edu.co.APIGateway.DTOs.LoginRequest;
import unicauca.edu.co.APIGateway.DTOs.LogoutRequest;
import unicauca.edu.co.APIGateway.Services.AuthService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService usuarioService;

    @PostMapping("/login")
    public Mono<Map> login(@RequestBody LoginRequest request) {
        return usuarioService.login(request);
    }

    @PostMapping("/logout")
    public Mono<String> logout(@RequestBody LogoutRequest request) {
        return usuarioService.logout(request);
    }
}
