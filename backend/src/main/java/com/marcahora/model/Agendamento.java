package com.marcahora.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id")
    @JsonIgnoreProperties({"agendamentos", "loja"})
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "servico_id")
    @JsonIgnoreProperties({"loja"})
    private Servico servico;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "profissional_id")
    @JsonIgnoreProperties({"loja"})
    private Profissional profissional;

    private LocalDateTime dataHora;

    @Column(length = 20)
    private String status; // confirmado, concluido, cancelado

    @Column(length = 500)
    private String observacoes;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "loja_id")
    @JsonIgnoreProperties({"agendamentos", "clientes", "servicos", "profissionais"})
    private Loja loja;
}