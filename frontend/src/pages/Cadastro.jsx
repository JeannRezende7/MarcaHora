import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/auth.css";
import "../styles/auth-override.css";

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
  const [carregando, setCarregando] = useState(false);

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

    setCarregando(true);

    const payload = {
      nome: nomeLoja,
      email,
      telefone,
      usaProfissionais,
      usaServicos,
      senha
    };

    console.log("📤 Enviando payload:", payload);
    console.log("✅ usaProfissionais:", usaProfissionais);
    console.log("✅ usaServicos:", usaServicos);

    try {
      const resp = await api.post("/api/cadastro/loja", payload);
      
      console.log("📥 Resposta do servidor:", resp.data);
      
      setCarregando(false);

      if (resp.data.sucesso) {
        alert("Loja criada com sucesso!");
        navigate("/login");
      }
    } catch (error) {
      console.error("❌ Erro ao cadastrar:", error);
      alert("Erro ao criar loja: " + (error.response?.data || error.message));
      setCarregando(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card auth-card-large">
        <div className="auth-header">
          <div className="auth-logo">📅</div>
          <h1>Criar sua conta</h1>
          <p>Preencha os dados para começar</p>
        </div>

        <form onSubmit={handleCadastrar} className="auth-form">
          
          {/* Código */}
          <div className="form-group">
            <label className="form-label">
              Código de Cadastro <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Solicite o código ao administrador"
              value={codigoCadastro}
              onChange={(e) => setCodigoCadastro(e.target.value)}
              required
            />
            <small className="form-hint">Entre em contato para obter o código</small>
          </div>

          {/* Nome da Loja */}
          <div className="form-group">
            <label className="form-label">
              Nome da Loja <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Salão Beleza Pura"
              value={nomeLoja}
              onChange={(e) => setNomeLoja(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">
              E-mail <span className="required">*</span>
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="contato@sualoja.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Telefone */}
          <div className="form-group">
            <label className="form-label">
              Telefone <span className="required">*</span>
            </label>
            <input
              type="tel"
              className="form-input"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
            />
          </div>

          {/* Profissionais */}
          <div className="form-group">
            <label className="form-label">Usa profissionais específicos?</label>
            <div className="radio-group-modern">
              <label className="radio-option-modern">
                <input
                  type="radio"
                  name="prof"
                  value="sim"
                  checked={usaProfissionais === true}
                  onChange={() => {
                    console.log("🔵 Mudou para: Usa Profissionais = TRUE");
                    setUsaProfissionais(true);
                  }}
                />
                <span>Sim (agenda por profissional)</span>
              </label>

              <label className="radio-option-modern">
                <input
                  type="radio"
                  name="prof"
                  value="nao"
                  checked={usaProfissionais === false}
                  onChange={() => {
                    console.log("🔵 Mudou para: Usa Profissionais = FALSE");
                    setUsaProfissionais(false);
                  }}
                />
                <span>Não (agenda única)</span>
              </label>
            </div>
          </div>

          {/* Serviços */}
          <div className="form-group">
            <label className="form-label">Trabalha com serviços predefinidos?</label>
            <div className="radio-group-modern">
              <label className="radio-option-modern">
                <input
                  type="radio"
                  name="serv"
                  value="sim"
                  checked={usaServicos === true}
                  onChange={() => {
                    console.log("🟢 Mudou para: Usa Serviços = TRUE");
                    setUsaServicos(true);
                  }}
                />
                <span>Sim (ex: corte, manicure)</span>
              </label>

              <label className="radio-option-modern">
                <input
                  type="radio"
                  name="serv"
                  value="nao"
                  checked={usaServicos === false}
                  onChange={() => {
                    console.log("🟢 Mudou para: Usa Serviços = FALSE");
                    setUsaServicos(false);
                  }}
                />
                <span>Não (reserva livre)</span>
              </label>
            </div>
          </div>

          {/* Senha */}
          <div className="form-group">
            <label className="form-label">
              Senha <span className="required">*</span>
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {/* Confirmar Senha */}
          <div className="form-group">
            <label className="form-label">
              Confirmar Senha <span className="required">*</span>
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Digite a senha novamente"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={carregando}
          >
            {carregando ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Já tem uma conta? {' '}
            <a onClick={() => navigate("/login")} className="auth-link">
              Fazer login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}