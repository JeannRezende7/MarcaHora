package com.marcahora.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class CampoPersonalizado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // A pergunta mostrada ao cliente
    @Column(nullable = false, length = 255)
    private String pergunta;

    // Tipo de resposta: texto, numero, booleano, multipla-escolha etc
    @Column(nullable = false, length = 50)
    private String tipoResposta;

    // Campo é obrigatório?
    private Boolean obrigatorio = false;

    // Loja dona do campo
    @ManyToOne
    @JoinColumn(name = "loja_id", nullable = false)
    private Loja loja;
}
