package com.marcahora.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class RespostaCampoPersonalizado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "agendamento_id")
    private Agendamento agendamento;

    @ManyToOne(optional = false)
    @JoinColumn(name = "campo_id")
    private CampoPersonalizado campo;

    @Column(length = 1000)
    private String resposta;
}
