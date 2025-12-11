import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/public.css";

export default function PublicSucesso() {
  const location = useLocation();
  const navigate = useNavigate();

  // Recebe dados vindos do PublicConfirmar.jsx
  const dados = location.state || {};

  const [contador, setContador] = useState(6);

  // Redirecionamento automático (opcional)
  useEffect(() => {
    const timer = setInterval(() => {
      setContador((c) => {
        if (c <= 1) {
          navigate(`/public/loja/${dados.lojaId}`);
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="public-container success-page">

      <div className="success-card">
        <div className="success-icon">✔</div>

        <h1>Agendamento Confirmado!</h1>

        <p className="success-msg">
          Seu horário foi reservado com sucesso.
        </p>

        <div className="success-details">
          {dados?.servicoNome && (
            <p><strong>Serviço:</strong> {dados.servicoNome}</p>
          )}

          <p><strong>Data:</strong> {dados.data}</p>
          <p><strong>Horário:</strong> {dados.horario}</p>

          {dados.nome && (
            <p><strong>Cliente:</strong> {dados.nome}</p>
          )}

          {dados.profissional && (
            <p>
              <strong>Profissional:</strong> {dados.profissional}
            </p>
          )}
        </div>

        <p className="redirect-msg">
          Você será redirecionado em <strong>{contador}</strong> segundos...
        </p>

        <button
          className="botao-voltar"
          onClick={() => navigate(`/public/loja/${dados.lojaId}`)}
        >
          Voltar para a Loja
        </button>
      </div>
    </div>
  );
}
