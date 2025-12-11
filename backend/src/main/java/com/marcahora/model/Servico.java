package com.marcahora.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Entity
public class Servico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private Integer duracaoMinutos;
    private BigDecimal preco;

    @ManyToOne
    @JoinColumn(name = "loja_id")
    private Loja loja;
}
