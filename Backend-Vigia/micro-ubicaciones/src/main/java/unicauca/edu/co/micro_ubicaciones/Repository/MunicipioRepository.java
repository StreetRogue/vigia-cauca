package unicauca.edu.co.micro_ubicaciones.Repository;


import org.springframework.data.jpa.repository.JpaRepository;
import unicauca.edu.co.micro_ubicaciones.Entitys.Municipio;

public interface MunicipioRepository extends JpaRepository<Municipio, Long> {
}

