package com.marcahora.repository;

import com.marcahora.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    // Procurar por email dentro da loja
    Optional<Cliente> findByEmailAndLojaId(String email, Long lojaId);

    // Procurar por telefone dentro da loja
    Optional<Cliente> findByTelefoneAndLojaId(String telefone, Long lojaId);

    // Listar clientes da loja
    List<Cliente> findByLojaId(Long lojaId);
}
