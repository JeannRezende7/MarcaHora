package com.marcahora.controller;

import com.marcahora.model.Agendamento;
import com.marcahora.model.Cliente;
import com.marcahora.model.Loja;
import com.marcahora.model.Servico;
import com.marcahora.repository.AgendamentoRepository;
import com.marcahora.repository.ClienteRepository;
import com.marcahora.repository.LojaRepository;
import com.marcahora.repository.ServicoRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/agendamentos")
public class AgendamentoController {

    private final AgendamentoRepository agendamentoRepository;
    private final LojaRepository lojaRepository;
    private final ClienteRepository clienteRepository;
    private final ServicoRepository servicoRepository;

    public AgendamentoController(AgendamentoRepository agendamentoRepository,
                                 LojaRepository lojaRepository,
                                 ClienteRepository clienteRepository,
                                 ServicoRepository servicoRepository) {
        this.agendamentoRepository = agendamentoRepository;
        this.lojaRepository = lojaRepository;
        this.clienteRepository = clienteRepository;
        this.servicoRepository = servicoRepository;
    }

    @GetMapping("/loja/{lojaId}")
    public List<Agendamento> listarPorLoja(@PathVariable Long lojaId) {
        return agendamentoRepository.findByLojaId(lojaId);
    }

    @GetMapping("/loja/{lojaId}/data")
    public List<Agendamento> listarPorData(
            @PathVariable Long lojaId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data
    ) {
        LocalDateTime inicio = data.atStartOfDay();
        LocalDateTime fim = data.atTime(LocalTime.MAX);
        return agendamentoRepository.findByLojaIdAndDataHoraBetween(lojaId, inicio, fim);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Agendamento> buscar(@PathVariable Long id) {
        return agendamentoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/loja/{lojaId}")
    public ResponseEntity<?> criar(
            @PathVariable Long lojaId,
            @RequestBody Map<String, Object> body
    ) {
        Long clienteId = Long.valueOf(body.get("clienteId").toString());
        Long servicoId = Long.valueOf(body.get("servicoId").toString());
        String dataHoraStr = body.get("dataHora").toString();
        String observacoes = body.getOrDefault("observacoes", "").toString();

        Loja loja = lojaRepository.findById(lojaId).orElse(null);
        Cliente cliente = clienteRepository.findById(clienteId).orElse(null);
        Servico servico = servicoRepository.findById(servicoId).orElse(null);

        if (loja == null || cliente == null || servico == null) {
            return ResponseEntity.badRequest().body("Dados inválidos");
        }

        LocalDateTime dataHora = LocalDateTime.parse(dataHoraStr);

        Agendamento ag = new Agendamento();
        ag.setLoja(loja);
        ag.setCliente(cliente);
        ag.setServico(servico);
        ag.setDataHora(dataHora);
        ag.setStatus("confirmado");
        ag.setObservacoes(observacoes);

        return ResponseEntity.ok(agendamentoRepository.save(ag));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> alterarStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String status = body.get("status");
        return agendamentoRepository.findById(id)
                .map(existing -> {
                    existing.setStatus(status);
                    return ResponseEntity.ok(agendamentoRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
