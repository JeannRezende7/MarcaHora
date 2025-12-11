package com.marcahora.repository;

import com.marcahora.model.RespostaCampoPersonalizado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RespostaCampoPersonalizadoRepository extends JpaRepository<RespostaCampoPersonalizado, Long> {

    List<RespostaCampoPersonalizado> findByAgendamentoId(Long agendamentoId);
}
