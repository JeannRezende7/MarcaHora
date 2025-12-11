package com.marcahora.repository;

import com.marcahora.model.CampoPersonalizado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CampoPersonalizadoRepository extends JpaRepository<CampoPersonalizado, Long> {

    List<CampoPersonalizado> findByLojaId(Long lojaId);
}
