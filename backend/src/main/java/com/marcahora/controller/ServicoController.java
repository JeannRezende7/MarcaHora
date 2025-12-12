package com.marcahora.controller;

import com.marcahora.model.Loja;
import com.marcahora.model.Servico;
import com.marcahora.repository.LojaRepository;
import com.marcahora.repository.ServicoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/servicos")
public class ServicoController {

    private final ServicoRepository servicoRepository;
    private final LojaRepository lojaRepository;

    public ServicoController(ServicoRepository servicoRepository, LojaRepository lojaRepository) {
        this.servicoRepository = servicoRepository;
        this.lojaRepository = lojaRepository;
    }

    @GetMapping("/loja/{lojaId}")
    public List<Servico> listarPorLoja(@PathVariable Long lojaId) {
        return servicoRepository.findByLojaId(lojaId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Servico> buscarPorId(@PathVariable Long id) {
        return servicoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/loja/{lojaId}")
    public ResponseEntity<?> criar(@PathVariable Long lojaId, @RequestBody Servico servico) {
        Loja loja = lojaRepository.findById(lojaId).orElse(null);
        if (loja == null) {
            return ResponseEntity.badRequest().body("Loja não encontrada");
        }
        servico.setId(null);
        servico.setLoja(loja);
        return ResponseEntity.ok(servicoRepository.save(servico));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Servico servico) {
        return servicoRepository.findById(id)
                .map(existing -> {
                    existing.setNome(servico.getNome());
                    existing.setDescricao(servico.getDescricao());
                    existing.setDuracaoMinutos(servico.getDuracaoMinutos());
                    existing.setPreco(servico.getPreco());
                    return ResponseEntity.ok(servicoRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (!servicoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        servicoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}