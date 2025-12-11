package com.marcahora.repository;

import com.marcahora.model.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    List<Agendamento> findByLojaId(Long lojaId);

    List<Agendamento> findByLojaIdAndDataHoraBetween(
            Long lojaId,
            LocalDateTime inicio,
            LocalDateTime fim
    );
}
