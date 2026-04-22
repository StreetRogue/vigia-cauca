package unicauca.edu.co.micro_usuarios.Clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import unicauca.edu.co.micro_usuarios.DTOs.Response.MunicipioResponseDTO;

import java.util.List;

@FeignClient(name = "ubicaciones", url = "${ubicaciones.url}")
public interface UbicacionesClient {

    @GetMapping("/municipios/{id}")
    MunicipioResponseDTO getMunicipio(@PathVariable Long id);

    @PostMapping("/municipios/batch")
    List<MunicipioResponseDTO> getMunicipios(@RequestBody List<Long> ids);
}
