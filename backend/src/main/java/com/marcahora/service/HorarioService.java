package com.marcahora.service;

import com.marcahora.model.Agendamento;
import com.marcahora.model.Loja;
import com.marcahora.model.Servico;
import com.marcahora.repository.AgendamentoRepository;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HorarioService {

    private final AgendamentoRepository agendamentoRepository;

    public HorarioService(AgendamentoRepository agendamentoRepository) {
        this.agendamentoRepository = agendamentoRepository;
    }

    public List<String> gerarHorariosDisponiveis(Loja loja,
                                                 LocalDate data,
                                                 Servico servicoOpcional) {

        if (Boolean.FALSE.equals(loja.getAtiva())) {
            return List.of(); // loja desativada, nada disponível
        }

        // 1) Verificar se o dia faz parte dos dias de funcionamento
        if (!diaPermitido(loja, data)) {
            return List.of();
        }

        // 2) Horário de abertura e fechamento
        LocalTime abre = parseHoraOuPadrao(loja.getHorarioAbertura(), LocalTime.of(9, 0));
        LocalTime fecha = parseHoraOuPadrao(loja.getHorarioFechamento(), LocalTime.of(18, 0));

        // 3) Intervalo entre slots
        int intervalo = (loja.getIntervaloAtendimento() != null && loja.getIntervaloAtendimento() > 0)
                ? loja.getIntervaloAtendimento()
                : 30;

        // 4) Duração do atendimento
        int duracaoMin = intervalo;
        if (Boolean.TRUE.equals(loja.getUsaServicos()) && servicoOpcional != null && servicoOpcional.getDuracaoMinutos() != null) {
            if (servicoOpcional.getDuracaoMinutos() > 0) {
                duracaoMin = servicoOpcional.getDuracaoMinutos();
            }
        }

        // 5) Buffer (antecedência mínima)
        int bufferMin = (loja.getTempoBufferMinutos() != null && loja.getTempoBufferMinutos() > 0)
                ? loja.getTempoBufferMinutos()
                : 0;

        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime minInicioHoje = agora.plusMinutes(bufferMin);

        // 6) Buscar agendamentos já ocupados no dia
        LocalDateTime inicioDia = data.atStartOfDay();
        LocalDateTime fimDia = data.atTime(LocalTime.MAX);

        List<LocalDateTime> ocupados = agendamentoRepository
                .findByLojaIdAndDataHoraBetween(loja.getId(), inicioDia, fimDia)
                .stream()
                .map(Agendamento::getDataHora)
                .collect(Collectors.toList());

        List<String> disponiveis = new ArrayList<>();

        for (LocalTime t = abre; t.plusMinutes(duracaoMin).isBefore(fecha.plusMinutes(1)); t = t.plusMinutes(intervalo)) {
            LocalDateTime dt = LocalDateTime.of(data, t);

            // pular horários no passado + buffer, se for hoje
            if (data.isEqual(agora.toLocalDate()) && dt.isBefore(minInicioHoje)) {
                continue;
            }

            // pular se já ocupado
            if (ocupados.contains(dt)) {
                continue;
            }

            disponiveis.add(t.toString()); // "09:00", "09:30"...
        }

        return disponiveis;
    }

    private boolean diaPermitido(Loja loja, LocalDate data) {
        String diasStr = loja.getDiasFuncionamento();
        if (diasStr == null || diasStr.isBlank()) {
            return true; // se não configurou, assume todo dia
        }
        int diaSemana = data.getDayOfWeek().getValue(); // 1..7 (segunda..domingo)
        String code = String.valueOf(diaSemana);

        return Arrays.stream(diasStr.split(","))
                .map(String::trim)
                .anyMatch(s -> s.equals(code));
    }

    private LocalTime parseHoraOuPadrao(String texto, LocalTime padrao) {
        try {
            if (texto != null && !texto.isBlank()) {
                return LocalTime.parse(texto);
            }
        } catch (Exception ignored) {
        }
        return padrao;
    }
}
