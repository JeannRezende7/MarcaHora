package com.marcahora.controller;

import com.marcahora.model.Loja;
import com.marcahora.model.Usuario;
import com.marcahora.repository.LojaRepository;
import com.marcahora.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cadastro")
public class CadastroController {

    private final LojaRepository lojaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public CadastroController(LojaRepository lojaRepository, UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.lojaRepository = lojaRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/loja")
    public ResponseEntity<?> cadastrarLoja(@RequestBody Map<String, Object> body) {

        String nome = (String) body.get("nome");
        String email = (String) body.get("email");
        String telefone = (String) body.get("telefone");
        Boolean usaProfissionais = (Boolean) body.getOrDefault("usaProfissionais", false);
        Boolean usaServicos = (Boolean) body.getOrDefault("usaServicos", false);
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

        // Cria a loja com defaults seguros
        Loja loja = new Loja();
        loja.setNome(nome);
        loja.setEmail(email);
        loja.setTelefone(telefone);
        loja.setAtiva(true);

        loja.setUsaProfissionais(usaProfissionais);
        loja.setUsaServicos(usaServicos);
        loja.setTipoNegocio("servico");

        // CONFIGS ESSENCIAIS (antes eram null!)
        loja.setHorarioAbertura("09:00");
        loja.setHorarioFechamento("18:00");
        loja.setIntervaloAtendimento(30);
        loja.setDiasFuncionamento("1,2,3,4,5");
        loja.setTempoBufferMinutos(0);

        loja.setObrigarNome(true);
        loja.setObrigarTelefone(true);
        loja.setObrigarEmail(false);
        loja.setMostrarObservacoes(true);

        Loja lojaSalva = lojaRepository.save(loja);

        // Criar usuário administrador
        Usuario usuario = new Usuario();
        usuario.setNome("Admin " + lojaSalva.getNome());
        usuario.setEmail(email);
        usuario.setSenha(passwordEncoder.encode(senha)); // ✅ CRIPTOGRAFADO
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