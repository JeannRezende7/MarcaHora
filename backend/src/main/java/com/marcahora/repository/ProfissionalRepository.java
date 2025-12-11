package com.marcahora.repository;

import com.marcahora.model.Profissional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProfissionalRepository extends JpaRepository<Profissional, Long> {

    List<Profissional> findByLojaId(Long lojaId);
}
