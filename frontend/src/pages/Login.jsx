import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/login.css";

export default function Login() {
  const { loginRequest } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    const ok = await loginRequest(email, senha);
    if (ok !== false) {
      navigate("/");
    } else {
      alert("E-mail ou senha incorretos!");
    }
  }

  return (
    <div className="login-wrapper">
      <h1>Entrar</h1>

      <label>E-mail</label>
      <input
        type="email"
        placeholder="seuemail@exemplo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label>Senha</label>
      <input
        type="password"
        placeholder="Digite sua senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />

      <button onClick={handleLogin}>
        Entrar
      </button>

      <a onClick={() => navigate("/cadastro")} className="cadastro-link">
        Não tem conta? Cadastre-se
      </a>
    </div>
  );
}
