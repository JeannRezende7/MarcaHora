package com.marcahora.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Profissional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "loja_id")
    private Loja loja;

    @Column(nullable = false)
    private String nome;

    private String email;

    private String telefone;

    private Boolean ativo = true;
}
