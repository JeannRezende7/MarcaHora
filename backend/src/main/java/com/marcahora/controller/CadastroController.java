package com.marcahora.controller;

import com.marcahora.model.Loja;
import com.marcahora.model.Usuario;
import com.marcahora.repository.LojaRepository;
import com.marcahora.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cadastro")
@CrossOrigin(origins = "*")
public class CadastroController {

    private final LojaRepository lojaRepository;
    private final UsuarioRepository usuarioRepository;

    public CadastroController(LojaRepository lojaRepository, UsuarioRepository usuarioRepository) {
        this.lojaRepository = lojaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/loja")
    public ResponseEntity<?> cadastrarLoja(@RequestBody Map<String, Object> body) {

        String nome = (String) body.get("nome");
        String email = (String) body.get("email");
        String telefone = (String) body.get("telefone");
        Boolean usaProfissionais = (Boolean) body.get("usaProfissionais");
        Boolean temServicos = (Boolean) body.get("temServicos");
        String senha = (String) body.get("senha");

        if (nome == null || nome.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Nome da loja é obrigatório"));
        }

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "E-mail é obrigatório"));
        }

        if (senha == null || senha.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Senha deve ter pelo menos 6 caracteres"));
        }

        // Cria a loja
        Loja loja = new Loja();
        loja.setNome(nome);
        loja.setEmail(email);
        loja.setTelefone(telefone);
        loja.setAtiva(true);
        loja.setUsaProfissionais(Boolean.TRUE.equals(usaProfissionais));
        loja.setUsaServicos(Boolean.TRUE.equals(temServicos));
        loja.setTipoNegocio("servico");

        Loja lojaSalva = lojaRepository.save(loja);

        // Cria o usuário administrador da loja
        Usuario usuario = new Usuario();
        usuario.setNome("Admin " + lojaSalva.getNome());
        usuario.setEmail(email);
        usuario.setSenha(senha);
        usuario.setLoja(lojaSalva);

        Usuario usuarioSalvo = usuarioRepository.save(usuario);

        return ResponseEntity.ok(Map.of(
                "sucesso", true,
                "lojaId", lojaSalva.getId(),
                "usuarioId", usuarioSalvo.getId(),
                "email", usuarioSalvo.getEmail()
        ));
    }
}
