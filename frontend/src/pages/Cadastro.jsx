import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/cadastro.css";

export default function Cadastro() {
  const navigate = useNavigate();

  const [codigoCadastro, setCodigoCadastro] = useState("");
  const [nomeLoja, setNomeLoja] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [usaProfissionais, setUsaProfissionais] = useState(false);
  const [usaServicos, setUsaServicos] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  async function handleCadastrar(e) {
    e.preventDefault();

    if (codigoCadastro !== "teste") {
      alert("Código de cadastro inválido!");
      return;
    }

    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    const payload = {
      nome: nomeLoja,
      email,
      telefone,
      usaProfissionais,
      usaServicos,
      senha
    };

    const resp = await api.post("/api/cadastro/loja", payload);

    if (resp.data.sucesso) {
      alert("Loja criada com sucesso!");
      navigate("/login");
    }
  }

  return (
    <div className="cadastro-wrapper">
      <h1>Cadastrar Loja</h1>

      <label>Código de Cadastro *</label>
      <input
        type="text"
        placeholder="Solicite o código ao administrador"
        value={codigoCadastro}
        onChange={(e) => setCodigoCadastro(e.target.value)}
      />
      <small>Entre em contato para obter o código</small>

      <label>Nome da Loja *</label>
      <input
        type="text"
        placeholder="Ex: Salão Beleza Pura"
        value={nomeLoja}
        onChange={(e) => setNomeLoja(e.target.value)}
      />

      <label>E-mail *</label>
      <input
        type="email"
        placeholder="contato@sualoja.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label>Telefone *</label>
      <input
        type="tel"
        placeholder="(00) 00000-0000"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
      />

      <label>Usa profissionais específicos?</label>
      <div className="radio-group">
        <div className="radio-option">
          <input
            type="radio"
            name="prof"
            value="sim"
            onChange={() => setUsaProfissionais(true)}
          />
          <span>Sim (agenda por profissional)</span>
        </div>

        <div className="radio-option">
          <input
            type="radio"
            name="prof"
            value="nao"
            defaultChecked
            onChange={() => setUsaProfissionais(false)}
          />
          <span>Não (agenda única)</span>
        </div>
      </div>

      <label>Trabalha com serviços predefinidos?</label>
      <div className="radio-group">
        <div className="radio-option">
          <input
            type="radio"
            name="serv"
            value="sim"
            onChange={() => setUsaServicos(true)}
          />
          <span>Sim (ex: corte, manicure)</span>
        </div>

        <div className="radio-option">
          <input
            type="radio"
            name="serv"
            value="nao"
            defaultChecked
            onChange={() => setUsaServicos(false)}
          />
          <span>Não (reserva livre — restaurantes)</span>
        </div>
      </div>

      <label>Senha *</label>
      <input
        type="password"
        placeholder="Mínimo 6 caracteres"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />

      <label>Confirmar Senha *</label>
      <input
        type="password"
        placeholder="Digite a senha novamente"
        value={confirmarSenha}
        onChange={(e) => setConfirmarSenha(e.target.value)}
      />

      <button onClick={handleCadastrar}>
        Cadastrar
      </button>

      <a onClick={() => navigate("/login")}>
        Já tem uma conta? Faça login
      </a>
    </div>
  );
}
