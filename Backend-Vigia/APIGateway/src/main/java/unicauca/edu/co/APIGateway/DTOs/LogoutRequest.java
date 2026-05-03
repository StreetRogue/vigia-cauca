package unicauca.edu.co.APIGateway.DTOs;

import lombok.Data;

@Data
public class LogoutRequest {
    private String refreshToken;
}
