package com.marcahora.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Loja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // DADOS BÁSICOS
    private String nome;
    private String telefone;
    private String email;

    // VISUAL
    private String corPrimaria;     // ex: "#1E90FF"
    private String corSecundaria;   // ex: "#FFFFFF"
    private String logoUrl;         // opcional
    private Boolean ativa = true;

    // CONFIGURAÇÕES DE AGENDAMENTO
    // formato "HH:mm" (24h)
    private String horarioAbertura;     // "08:00"
    private String horarioFechamento;   // "18:00"

    // intervalo base entre horários em minutos
    private Integer intervaloAtendimento; // ex: 30

    // dias de funcionamento: "1,2,3,4,5" (1 = segunda, 7 = domingo)
    private String diasFuncionamento;

    // tempo extra entre agendamentos (em minutos)
    private Integer tempoBufferMinutos;

    // TIPO DE NEGÓCIO / MODOS
    private Boolean usaServicos;        // true = exige serviço
    private Boolean usaProfissionais;   // true = tem profissional
    private String tipoNegocio;         // "servico", "reserva", etc.

    // CAMPOS OBRIGATÓRIOS DO CLIENTE
    private Boolean obrigarNome;
    private Boolean obrigarTelefone;
    private Boolean obrigarEmail;
    private Boolean mostrarObservacoes;

    @PrePersist
    @PreUpdate
    private void ajustarDefaults() {
        if (horarioAbertura == null || horarioAbertura.isBlank()) {
            horarioAbertura = "09:00";
        }
        if (horarioFechamento == null || horarioFechamento.isBlank()) {
            horarioFechamento = "18:00";
        }
        if (intervaloAtendimento == null || intervaloAtendimento <= 0) {
            intervaloAtendimento = 30;
        }
        if (diasFuncionamento == null || diasFuncionamento.isBlank()) {
            diasFuncionamento = "1,2,3,4,5"; // seg a sex
        }
        if (tempoBufferMinutos == null || tempoBufferMinutos < 0) {
            tempoBufferMinutos = 0;
        }
        if (usaServicos == null) {
            usaServicos = Boolean.TRUE;
        }
        if (usaProfissionais == null) {
            usaProfissionais = Boolean.FALSE;
        }
        if (obrigarNome == null) {
            obrigarNome = Boolean.TRUE;
        }
        if (obrigarTelefone == null) {
            obrigarTelefone = Boolean.TRUE;
        }
        if (obrigarEmail == null) {
            obrigarEmail = Boolean.FALSE;
        }
        if (mostrarObservacoes == null) {
            mostrarObservacoes = Boolean.TRUE;
        }
        if (ativa == null) {
            ativa = Boolean.TRUE;
        }
    }
}