package unicauca.edu.co.APIGateway.DTOs;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}
