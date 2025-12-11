package com.marcahora.controller;

import com.marcahora.model.Usuario;
import com.marcahora.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;

    public AuthController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String senha = body.get("senha");

        return usuarioRepository.findByEmailAndSenha(email, senha)
                .map(usuario -> ResponseEntity.ok(Map.of(
                        "id", usuario.getId(),
                        "nome", usuario.getNome(),
                        "email", usuario.getEmail(),
                        "lojaId", usuario.getLoja().getId(),
                        "lojaNome", usuario.getLoja().getNome()
                )))
                .orElseGet(() -> ResponseEntity.status(401)
                        .body(Map.of("erro", "Credenciais inválidas")));
    }
}
