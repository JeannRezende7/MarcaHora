package com.marcahora.controller;

import com.marcahora.model.Agendamento;
import com.marcahora.model.Cliente;
import com.marcahora.model.Loja;
import com.marcahora.model.Servico;
import com.marcahora.repository.AgendamentoRepository;
import com.marcahora.repository.ClienteRepository;
import com.marcahora.repository.LojaRepository;
import com.marcahora.repository.ServicoRepository;
import com.marcahora.service.HorarioService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/public")
public class PublicAgendamentoController {

    private final LojaRepository lojaRepository;
    private final ServicoRepository servicoRepository;
    private final ClienteRepository clienteRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final HorarioService horarioService;

    public PublicAgendamentoController(LojaRepository lojaRepository,
            ServicoRepository servicoRepository,
            ClienteRepository clienteRepository,
            AgendamentoRepository agendamentoRepository,
            HorarioService horarioService) {
        this.lojaRepository = lojaRepository;
        this.servicoRepository = servicoRepository;
        this.clienteRepository = clienteRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.horarioService = horarioService;
    }

    // =======================
    // INFO PÚBLICA DA LOJA
    // =======================
    @GetMapping("/loja/{id}")
    public ResponseEntity<?> infoLoja(@PathVariable Long id) {
        Optional<Loja> opt = lojaRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("erro", "Loja não encontrada"));
        }

        Loja loja = opt.get();
        if (Boolean.FALSE.equals(loja.getAtiva())) {
            return ResponseEntity.ok(Map.of(
                    "status", "offline",
                    "mensagem", "Loja está temporariamente indisponível."));
        }

        List<Servico> servicos = Collections.emptyList();
        if (Boolean.TRUE.equals(loja.getUsaServicos())) {
            servicos = servicoRepository.findByLojaId(loja.getId());
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "online");
        response.put("loja", loja);
        response.put("servicos", servicos);

        return ResponseEntity.ok(response);
    }

    // =======================
    // HORÁRIOS DISPONÍVEIS
    // =======================
    @GetMapping("/agendamentos/horarios")
    public ResponseEntity<?> horariosDisponiveis(
            @RequestParam Long lojaId,
            @RequestParam(required = false) Long servicoId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        Optional<Loja> optLoja = lojaRepository.findById(lojaId);
        if (optLoja.isEmpty()) {
            return ResponseEntity.badRequest().body("Loja não encontrada");
        }
        Loja loja = optLoja.get();

        Servico servico = null;
        if (Boolean.TRUE.equals(loja.getUsaServicos()) && servicoId != null && servicoId > 0) {
            servico = servicoRepository.findById(servicoId).orElse(null);
            if (servico == null) {
                return ResponseEntity.badRequest().body("Serviço não encontrado");
            }
        }

        List<String> horarios = horarioService.gerarHorariosDisponiveis(loja, data, servico);

        return ResponseEntity.ok(Map.of(
                "data", data,
                "horarios", horarios));
    }

    // =======================
    // CRIAR AGENDAMENTO PÚBLICO
    // =======================
    @PostMapping("/agendamentos/criar")
    public ResponseEntity<?> criarAgendamentoPublico(@RequestBody Map<String, Object> body) {
        try {
            Long lojaId = Long.valueOf(body.get("lojaId").toString());
            String dataHoraStr = body.get("dataHora").toString(); // ex: "2025-12-10T14:30"
            String nome = Objects.toString(body.get("nome"), "").trim();
            String telefone = Objects.toString(body.get("telefone"), "").trim();
            String email = Objects.toString(body.get("email"), "").trim();
            String observacoes = Objects.toString(body.get("observacoes"), "").trim();

            Long servicoId = null;
            if (body.containsKey("servicoId") && body.get("servicoId") != null) {
                String s = body.get("servicoId").toString();
                if (!s.isBlank() && !s.equals("0")) {
                    servicoId = Long.valueOf(s);
                }
            }

            Loja loja = lojaRepository.findById(lojaId)
                    .orElseThrow(() -> new RuntimeException("Loja não encontrada"));

            // valida campos obrigatórios conforme config da loja
            if (Boolean.TRUE.equals(loja.getObrigarNome()) && nome.isEmpty()) {
                return ResponseEntity.badRequest().body("Nome é obrigatório.");
            }
            if (Boolean.TRUE.equals(loja.getObrigarTelefone()) && telefone.isEmpty()) {
                return ResponseEntity.badRequest().body("Telefone é obrigatório.");
            }
            if (Boolean.TRUE.equals(loja.getObrigarEmail()) && email.isEmpty()) {
                return ResponseEntity.badRequest().body("E-mail é obrigatório.");
            }

            Servico servico = null;
            if (Boolean.TRUE.equals(loja.getUsaServicos())) {
                if (servicoId == null) {
                    return ResponseEntity.badRequest().body("Serviço é obrigatório.");
                }
                servico = servicoRepository.findById(servicoId)
                        .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));
            }

            LocalDateTime dataHora = LocalDateTime.parse(dataHoraStr);

            // Última validação: checar se o horário ainda está disponível
            List<String> horarios = horarioService.gerarHorariosDisponiveis(loja, dataHora.toLocalDate(), servico);
            String horarioStr = dataHora.toLocalTime().toString();
            if (!horarios.contains(horarioStr)) {
                return ResponseEntity.badRequest().body("Horário não está mais disponível.");
            }

            // Buscar ou criar cliente
            Cliente cliente = null;
            if (!email.isEmpty()) {
                cliente = clienteRepository.findByEmailAndLojaId(email, lojaId).orElse(null);
            }
            if (cliente == null && !telefone.isEmpty()) {
                cliente = clienteRepository.findByTelefoneAndLojaId(telefone, lojaId).orElse(null);
            }
            if (cliente == null) {
                cliente = new Cliente();
                cliente.setNome(nome);
                cliente.setTelefone(telefone);
                cliente.setEmail(email);
                cliente.setLoja(loja);
                clienteRepository.save(cliente);
            } else {
                // Atualiza dados básicos, se vierem preenchidos
                if (!nome.isEmpty())
                    cliente.setNome(nome);
                if (!telefone.isEmpty())
                    cliente.setTelefone(telefone);
                if (!email.isEmpty())
                    cliente.setEmail(email);
                clienteRepository.save(cliente);
            }

            // Criar agendamento
            Agendamento ag = new Agendamento();
            ag.setLoja(loja);
            ag.setCliente(cliente);
            ag.setServico(servico);
            ag.setDataHora(dataHora);
            ag.setObservacoes(observacoes);
            ag.setStatus("AGENDADO"); // se tiver enum depois, adaptamos

            agendamentoRepository.save(ag);

            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("mensagem", "Agendamento criado com sucesso.");
            resp.put("agendamentoId", ag.getId());

            return ResponseEntity.ok(resp);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro ao criar agendamento: " + e.getMessage());
        }
    }

    public static class CampoPersonalizadoRespostaDTO {
        public Long campoId;
        public String resposta;
    }

    public static class CriarAgendamentoRequest {
        public Long lojaId;
        public Long servicoId; // opcional se loja não usa serviços
        public Long profissionalId; // opcional se loja não usa profissionais
        public String dataHora; // ISO string
        public String nome;
        public String telefone;
        public String email;
        public String observacoes;
        public java.util.List<CampoPersonalizadoRespostaDTO> camposPersonalizados;
    }

}
