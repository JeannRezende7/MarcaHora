package com.marcahora.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "servico_id")
    private Servico servico;

    // NOVO → profissional pode ser opcional
    @ManyToOne
    @JoinColumn(name = "profissional_id")
    private Profissional profissional;

    private LocalDateTime dataHora;

    @Column(length = 20)
    private String status; // confirmado, concluido, cancelado

    @Column(length = 500)
    private String observacoes;

    @ManyToOne
    @JoinColumn(name = "loja_id")
    private Loja loja;
}
