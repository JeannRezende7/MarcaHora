INSERT INTO loja (id, nome, telefone, email, ativa)
VALUES (1, 'Loja Demo', '(21) 99999-0000', 'contato@lojademo.com', TRUE);

INSERT INTO usuario (id, nome, email, senha, loja_id)
VALUES (1, 'Admin', 'admin@demo.com', '123', 1);
