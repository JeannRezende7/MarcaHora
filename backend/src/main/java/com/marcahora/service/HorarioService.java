package com.marcahora.service;

import com.marcahora.model.Agendamento;
import com.marcahora.model.Loja;
import com.marcahora.model.Profissional;
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

    // ============================
    // OVERLOAD — sem profissional
    // ============================
    public List<String> gerarHorariosDisponiveis(Loja loja, LocalDate data, Servico servico) {
        return gerarHorariosDisponiveis(loja, data, servico, null);
    }

    // ============================
    // MÉTODO PRINCIPAL
    // ============================
    public List<String> gerarHorariosDisponiveis(
            Loja loja,
            LocalDate data,
            Servico servicoOpcional,
            Profissional profissionalOpcional) {

        if (Boolean.FALSE.equals(loja.getAtiva())) {
            return List.of();
        }

        // --- Dias de funcionamento ---
        Set<DayOfWeek> diasFuncionamento = parseDiasFuncionamento(loja.getDiasFuncionamento());
        DayOfWeek dow = data.getDayOfWeek();

        if (!diasFuncionamento.isEmpty() && !diasFuncionamento.contains(dow)) {
            return List.of();
        }

        // --- Abertura / Fechamento ---
        LocalTime abertura = parseHora(loja.getHorarioAbertura(), LocalTime.of(9, 0));
        LocalTime fechamento = parseHora(loja.getHorarioFechamento(), LocalTime.of(18, 0));

        if (!fechamento.isAfter(abertura)) {
            fechamento = abertura.plusHours(1);
        }

        // --- Intervalo e Buffer ---
        int intervaloMin = Optional.ofNullable(loja.getIntervaloAtendimento()).orElse(30);
        int bufferMin = Optional.ofNullable(loja.getTempoBufferMinutos()).orElse(0);

        // Serviço com duração personalizada
        int duracaoSlot = intervaloMin;
        if (servicoOpcional != null &&
                servicoOpcional.getDuracaoMinutos() != null &&
                servicoOpcional.getDuracaoMinutos() > 0) {
            duracaoSlot = servicoOpcional.getDuracaoMinutos();
        }

        LocalDateTime inicioDia = LocalDateTime.of(data, abertura);
        LocalDateTime fimDia = LocalDateTime.of(data, fechamento);
        LocalDateTime agora = LocalDateTime.now();

        // ============================
        // AGENDAMENTOS EXISTENTES
        // ============================
        List<Agendamento> agendamentosDoDia;

        if (profissionalOpcional != null &&
            Boolean.TRUE.equals(loja.getUsaProfissionais())) {

            agendamentosDoDia = agendamentoRepository
                    .findByLojaIdAndProfissionalIdAndDataHoraBetween(
                            loja.getId(),
                            profissionalOpcional.getId(),
                            inicioDia,
                            fimDia);
        } else {
            agendamentosDoDia = agendamentoRepository
                    .findByLojaIdAndDataHoraBetween(
                            loja.getId(), inicioDia, fimDia);
        }

        List<LocalDateTime> ocupados = agendamentosDoDia
                .stream()
                .map(Agendamento::getDataHora)
                .collect(Collectors.toList());

        // ============================
        // GERAR HORÁRIOS
        // ============================
        List<String> resultado = new ArrayList<>();
        LocalDateTime cursor = inicioDia;

        while (!cursor.isAfter(fimDia.minusMinutes(duracaoSlot))) {

            // Bloqueia horários passados + buffer
            boolean horarioPassado =
                    (!cursor.toLocalDate().isAfter(agora.toLocalDate())) &&
                            cursor.isBefore(agora.plusMinutes(bufferMin));

            if (horarioPassado) {
                cursor = cursor.plusMinutes(intervaloMin);
                continue;
            }

            // Verifica conflito
            boolean ocupado = false;
            for (LocalDateTime ag : ocupados) {
                if (ag.equals(cursor)) {
                    ocupado = true;
                    break;
                }
            }

            if (!ocupado) {
                resultado.add(cursor.toLocalTime().toString()); // Ex: "14:30"
            }

            cursor = cursor.plusMinutes(intervaloMin);
        }

        return resultado;
    }

    // =====================================================
    // MÉTODOS AUXILIARES (agora funcionando 100%)
    // =====================================================

    /** Converte "09:00" → LocalTime */
    private LocalTime parseHora(String valor, LocalTime padrao) {
        if (valor == null || valor.isBlank()) return padrao;

        try {
            return LocalTime.parse(valor);
        } catch (Exception e) {
            return padrao;
        }
    }

    /** Converte "1,2,3,4" → Set<DayOfWeek> */
    private Set<DayOfWeek> parseDiasFuncionamento(String dias) {
        if (dias == null || dias.isBlank()) return Set.of();

        try {
            List<String> list = Arrays.asList(dias.split(","));

            return list.stream()
                    .map(String::trim)
                    .map(Integer::parseInt)
                    .map(i -> DayOfWeek.of(i))
                    .collect(Collectors.toSet());

        } catch (Exception e) {
            return Set.of();
        }
    }
}
