package unicauca.edu.co.micro_ubicaciones.Controller;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import unicauca.edu.co.micro_ubicaciones.DTOs.Response.MunicipioResponseDTO;
import unicauca.edu.co.micro_ubicaciones.Services.MunicipioService;

import java.util.List;

@RestController
@RequestMapping("/municipios")
@RequiredArgsConstructor
public class MunicipioController {

    private final MunicipioService municipioService;

    @GetMapping("/{id}")
    public ResponseEntity<MunicipioResponseDTO> getById(@PathVariable Long id) {
        MunicipioResponseDTO response = municipioService.getById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public List<MunicipioResponseDTO> getAll() {
        return municipioService.getAll();
    }

    @PostMapping("/batch")
    public List<MunicipioResponseDTO> getByIds(@RequestBody List<Long> ids) {
        return municipioService.getByIds(ids);
    }
}
