package com.marcahora.repository;

import com.marcahora.model.Servico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServicoRepository extends JpaRepository<Servico, Long> {
    List<Servico> findByLojaId(Long lojaId);
}
