package com.marcahora.controller;

import com.marcahora.model.CampoPersonalizado;
import com.marcahora.model.Loja;
import com.marcahora.repository.CampoPersonalizadoRepository;
import com.marcahora.repository.LojaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/configuracoes")
public class ConfiguracoesController {

    private final LojaRepository lojaRepository;
    private final CampoPersonalizadoRepository campoPersonalizadoRepository;

    public ConfiguracoesController(LojaRepository lojaRepository,
                                   CampoPersonalizadoRepository campoPersonalizadoRepository) {
        this.lojaRepository = lojaRepository;
        this.campoPersonalizadoRepository = campoPersonalizadoRepository;
    }

    // --------------------------------------------------------------------
    // 1) Obter todas as configurações da loja (dados + campos personalizados)
    // --------------------------------------------------------------------
    @GetMapping("/{lojaId}")
    public ResponseEntity<?> obterConfiguracoes(@PathVariable Long lojaId) {
        Optional<Loja> optLoja = lojaRepository.findById(lojaId);
        if (optLoja.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Loja loja = optLoja.get();

        List<CampoPersonalizado> campos = campoPersonalizadoRepository.findByLojaId(lojaId);

        Map<String, Object> body = new LinkedHashMap<>();

        body.put("id", loja.getId());
        body.put("nome", loja.getNome());
        body.put("telefone", loja.getTelefone());
        body.put("email", loja.getEmail());
        body.put("logoUrl", loja.getLogoUrl());
        body.put("corPrimaria", loja.getCorPrimaria());
        body.put("corSecundaria", loja.getCorSecundaria());

        body.put("horarioAbertura", loja.getHorarioAbertura());
        body.put("horarioFechamento", loja.getHorarioFechamento());
        body.put("intervaloAtendimento", loja.getIntervaloAtendimento());
        body.put("tempoBufferMinutos", loja.getTempoBufferMinutos());

        // diasFuncionamento é armazenado como string "1,2,3,4,5"
        String dias = loja.getDiasFuncionamento();
        if (dias != null && !dias.isBlank()) {
            body.put("diasFuncionamento", Arrays.asList(dias.split(",")));
        } else {
            body.put("diasFuncionamento", Collections.emptyList());
        }

        body.put("obrigarNome", loja.getObrigarNome());
        body.put("obrigarTelefone", loja.getObrigarTelefone());
        body.put("obrigarEmail", loja.getObrigarEmail());

        body.put("usaServicos", loja.getUsaServicos());
        body.put("usaProfissionais", loja.getUsaProfissionais());
        body.put("mostrarObservacoes", loja.getMostrarObservacoes());

        body.put("camposPersonalizados", campos);

        return ResponseEntity.ok(body);
    }

    // --------------------------------------------------------------------
    // 2) Atualizar informações básicas da loja
    // --------------------------------------------------------------------
    @PutMapping("/{lojaId}/info")
    public ResponseEntity<?> salvarInfoLoja(@PathVariable Long lojaId,
                                            @RequestBody Map<String, Object> body) {
        return lojaRepository.findById(lojaId)
                .map(loja -> {
                    loja.setNome((String) body.getOrDefault("nome", loja.getNome()));
                    loja.setTelefone((String) body.getOrDefault("telefone", loja.getTelefone()));
                    loja.setEmail((String) body.getOrDefault("email", loja.getEmail()));
                    loja.setLogoUrl((String) body.getOrDefault("logoUrl", loja.getLogoUrl()));
                    loja.setCorPrimaria((String) body.getOrDefault("corPrimaria", loja.getCorPrimaria()));
                    loja.setCorSecundaria((String) body.getOrDefault("corSecundaria", loja.getCorSecundaria()));
                    Loja salvo = lojaRepository.save(loja);
                    return ResponseEntity.ok(salvo);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // --------------------------------------------------------------------
    // 3) Atualizar horários de funcionamento
    // --------------------------------------------------------------------
    @PutMapping("/{lojaId}/horarios")
    public ResponseEntity<?> salvarHorarios(@PathVariable Long lojaId,
                                            @RequestBody Map<String, Object> body) {
        return lojaRepository.findById(lojaId)
                .map(loja -> {
                    loja.setHorarioAbertura((String) body.getOrDefault("abertura", loja.getHorarioAbertura()));
                    loja.setHorarioFechamento((String) body.getOrDefault("fechamento", loja.getHorarioFechamento()));

                    Object intervaloObj = body.get("intervalo");
                    if (intervaloObj instanceof Number) {
                        loja.setIntervaloAtendimento(((Number) intervaloObj).intValue());
                    }

                    Object bufferObj = body.get("buffer");
                    if (bufferObj instanceof Number) {
                        loja.setTempoBufferMinutos(((Number) bufferObj).intValue());
                    }

                    Object diasObj = body.get("dias");
                    if (diasObj instanceof List<?>) {
                        @SuppressWarnings("unchecked")
                        List<String> lista = (List<String>) diasObj;
                        String join = String.join(",", lista);
                        loja.setDiasFuncionamento(join);
                    }

                    Loja salvo = lojaRepository.save(loja);
                    return ResponseEntity.ok(salvo);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // --------------------------------------------------------------------
    // 4) Atualizar campos obrigatórios do cliente
    // --------------------------------------------------------------------
    @PutMapping("/{lojaId}/campos-obrigatorios")
    public ResponseEntity<?> salvarCamposObrigatorios(@PathVariable Long lojaId,
                                                      @RequestBody Map<String, Object> body) {
        return lojaRepository.findById(lojaId)
                .map(loja -> {
                    Object nome = body.get("obrigarNome");
                    Object email = body.get("obrigarEmail");
                    Object telefone = body.get("obrigarTelefone");

                    if (nome instanceof Boolean) {
                        loja.setObrigarNome((Boolean) nome);
                    }
                    if (email instanceof Boolean) {
                        loja.setObrigarEmail((Boolean) email);
                    }
                    if (telefone instanceof Boolean) {
                        loja.setObrigarTelefone((Boolean) telefone);
                    }

                    Loja salvo = lojaRepository.save(loja);
                    return ResponseEntity.ok(salvo);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // --------------------------------------------------------------------
    // 5) Atualizar modos de negócio (serviços, profissionais, observações)
    // --------------------------------------------------------------------
    @PutMapping("/{lojaId}/modos")
    public ResponseEntity<?> salvarModos(@PathVariable Long lojaId,
                                         @RequestBody Map<String, Object> body) {
        return lojaRepository.findById(lojaId)
                .map(loja -> {
                    Object usaServicos = body.get("usaServicos");
                    Object usaProfissionais = body.get("usaProfissionais");
                    Object mostrarObs = body.get("mostrarObservacoes");

                    if (usaServicos instanceof Boolean) {
                        loja.setUsaServicos((Boolean) usaServicos);
                    }
                    if (usaProfissionais instanceof Boolean) {
                        loja.setUsaProfissionais((Boolean) usaProfissionais);
                    }
                    if (mostrarObs instanceof Boolean) {
                        loja.setMostrarObservacoes((Boolean) mostrarObs);
                    }

                    Loja salvo = lojaRepository.save(loja);
                    return ResponseEntity.ok(salvo);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // --------------------------------------------------------------------
    // 6) CAMPOS PERSONALIZADOS
    // --------------------------------------------------------------------
    @GetMapping("/{lojaId}/campos-personalizados")
    public ResponseEntity<List<CampoPersonalizado>> listarCampos(@PathVariable Long lojaId) {
        List<CampoPersonalizado> lista = campoPersonalizadoRepository.findByLojaId(lojaId);
        return ResponseEntity.ok(lista);
    }

    @PostMapping("/{lojaId}/campos-personalizados")
    public ResponseEntity<?> adicionarCampo(@PathVariable Long lojaId,
                                            @RequestBody Map<String, Object> body) {
        Optional<Loja> optLoja = lojaRepository.findById(lojaId);
        if (optLoja.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String pergunta = (String) body.get("pergunta");
        if (pergunta == null || pergunta.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Pergunta é obrigatória"));
        }

        String tipoResposta = (String) body.getOrDefault("tipoResposta", "texto");
        Object obrigatorioObj = body.get("obrigatorio");
        Boolean obrigatorio = (obrigatorioObj instanceof Boolean) ? (Boolean) obrigatorioObj : Boolean.FALSE;

        CampoPersonalizado campo = new CampoPersonalizado();
        campo.setLoja(optLoja.get());
        campo.setPergunta(pergunta);
        campo.setTipoResposta(tipoResposta);
        campo.setObrigatorio(obrigatorio);

        CampoPersonalizado salvo = campoPersonalizadoRepository.save(campo);
        return ResponseEntity.ok(salvo);
    }

    @DeleteMapping("/{lojaId}/campos-personalizados/{campoId}")
    public ResponseEntity<Void> removerCampo(@PathVariable Long lojaId,
                                             @PathVariable Long campoId) {
        Optional<CampoPersonalizado> optCampo = campoPersonalizadoRepository.findById(campoId);
        if (optCampo.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        CampoPersonalizado campo = optCampo.get();
        if (!campo.getLoja().getId().equals(lojaId)) {
            return ResponseEntity.status(403).build();
        }
        campoPersonalizadoRepository.delete(campo);
        return ResponseEntity.noContent().build();
    }
}
