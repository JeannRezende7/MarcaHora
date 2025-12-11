package com.marcahora.controller;

import com.marcahora.model.Cliente;
import com.marcahora.model.Loja;
import com.marcahora.repository.ClienteRepository;
import com.marcahora.repository.LojaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteRepository clienteRepository;
    private final LojaRepository lojaRepository;

    public ClienteController(ClienteRepository clienteRepository, LojaRepository lojaRepository) {
        this.clienteRepository = clienteRepository;
        this.lojaRepository = lojaRepository;
    }

    @GetMapping("/loja/{lojaId}")
    public List<Cliente> listarPorLoja(@PathVariable Long lojaId) {
        return clienteRepository.findByLojaId(lojaId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> buscar(@PathVariable Long id) {
        return clienteRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/loja/{lojaId}")
    public ResponseEntity<?> criar(@PathVariable Long lojaId, @RequestBody Cliente cliente) {
        Loja loja = lojaRepository.findById(lojaId).orElse(null);
        if (loja == null) {
            return ResponseEntity.badRequest().body("Loja não encontrada");
        }
        cliente.setId(null);
        cliente.setLoja(loja);
        return ResponseEntity.ok(clienteRepository.save(cliente));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Cliente cliente) {
        return clienteRepository.findById(id)
                .map(existing -> {
                    existing.setNome(cliente.getNome());
                    existing.setTelefone(cliente.getTelefone());
                    existing.setEmail(cliente.getEmail());
                    existing.setAnotacoes(cliente.getAnotacoes());
                    return ResponseEntity.ok(clienteRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (!clienteRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        clienteRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
