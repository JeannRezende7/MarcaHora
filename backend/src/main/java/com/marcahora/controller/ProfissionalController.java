package com.marcahora.controller;

import com.marcahora.model.Loja;
import com.marcahora.model.Profissional;
import com.marcahora.repository.LojaRepository;
import com.marcahora.repository.ProfissionalRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/profissionais")
public class ProfissionalController {

    private final ProfissionalRepository profissionalRepository;
    private final LojaRepository lojaRepository;

    public ProfissionalController(ProfissionalRepository profissionalRepository, LojaRepository lojaRepository) {
        this.profissionalRepository = profissionalRepository;
        this.lojaRepository = lojaRepository;
    }

    @GetMapping("/loja/{lojaId}")
    public List<Profissional> listarPorLoja(@PathVariable Long lojaId) {
        return profissionalRepository.findByLojaId(lojaId);
    }

    // Endpoint público - retorna apenas profissionais ativos
    @GetMapping("/public/loja/{lojaId}")
    public List<Profissional> listarAtivosPublico(@PathVariable Long lojaId) {
        return profissionalRepository.findByLojaId(lojaId)
                .stream()
                .filter(p -> p.getAtivo() != null && p.getAtivo())
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Profissional> buscarPorId(@PathVariable Long id) {
        return profissionalRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/loja/{lojaId}")
    public ResponseEntity<?> criar(@PathVariable Long lojaId, @RequestBody Profissional profissional) {
        Loja loja = lojaRepository.findById(lojaId).orElse(null);
        if (loja == null) {
            return ResponseEntity.badRequest().body("Loja não encontrada");
        }
        profissional.setId(null);
        profissional.setLoja(loja);
        if (profissional.getAtivo() == null) {
            profissional.setAtivo(true);
        }
        return ResponseEntity.ok(profissionalRepository.save(profissional));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Profissional profissional) {
        return profissionalRepository.findById(id)
                .map(existing -> {
                    existing.setNome(profissional.getNome());
                    existing.setEmail(profissional.getEmail());
                    existing.setTelefone(profissional.getTelefone());
                    existing.setAtivo(profissional.getAtivo());
                    return ResponseEntity.ok(profissionalRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (!profissionalRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        profissionalRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}