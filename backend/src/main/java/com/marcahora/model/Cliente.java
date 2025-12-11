package com.marcahora.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String telefone;
    private String email;

    private LocalDateTime criadoEm = LocalDateTime.now();

    @Column(length = 1000)
    private String anotacoes;

    @ManyToOne
    @JoinColumn(name = "loja_id")
    private Loja loja;
}
