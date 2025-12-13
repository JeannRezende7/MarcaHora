import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/public.css";
import '../styles/public-reset.css'; 
import '../styles/public.css';  

export default function PublicSucesso() {
  const location = useLocation();
  const navigate = useNavigate();

  const dados = location.state || {};
  const [contador, setContador] = useState(10);

  // Redirecionamento automático
  useEffect(() => {
    const timer = setInterval(() => {
      setContador((c) => {
        if (c <= 1) {
          if (dados.lojaId) {
            navigate(`/public/loja/${dados.lojaId}`);
          } else {
            navigate('/');
          }
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [dados.lojaId, navigate]);

  return (
    <div className="public-container">
      <div className="public-wrapper">
        
        {/* CARD DE SUCESSO */}
        <div className="public-card sucesso-container">
          
          {/* ÍCONE ANIMADO */}
          <div className="sucesso-icon">✅</div>

          {/* TÍTULO */}
          <h1 className="sucesso-titulo">
            Agendamento Confirmado!
          </h1>

          {/* MENSAGEM */}
          <p className="sucesso-mensagem">
            Seu horário foi reservado com sucesso. Em breve você receberá uma confirmação.
          </p>

          {/* DETALHES DO AGENDAMENTO */}
          <div className="sucesso-detalhes">
            
            {dados?.servicoNome && (
              <div className="sucesso-detalhes-item">
                <span className="sucesso-detalhes-label">Serviço</span>
                <span className="sucesso-detalhes-valor">{dados.servicoNome}</span>
              </div>
            )}

            {dados?.data && (
              <div className="sucesso-detalhes-item">
                <span className="sucesso-detalhes-label">Data</span>
                <span className="sucesso-detalhes-valor">{dados.data}</span>
              </div>
            )}

            {dados?.horario && (
              <div className="sucesso-detalhes-item">
                <span className="sucesso-detalhes-label">Horário</span>
                <span className="sucesso-detalhes-valor">{dados.horario}</span>
              </div>
            )}

            {dados?.nome && (
              <div className="sucesso-detalhes-item">
                <span className="sucesso-detalhes-label">Cliente</span>
                <span className="sucesso-detalhes-valor">{dados.nome}</span>
              </div>
            )}

            {dados?.profissional && (
              <div className="sucesso-detalhes-item">
                <span className="sucesso-detalhes-label">Profissional</span>
                <span className="sucesso-detalhes-valor">{dados.profissional}</span>
              </div>
            )}
          </div>

          {/* REDIRECIONAMENTO */}
          <div style={{
            background: '#f5f6fa',
            padding: '16px',
            borderRadius: '12px',
            marginTop: '30px',
            marginBottom: '20px',
            textAlign: 'center',
            color: '#666',
            fontSize: '14px'
          }}>
            🔄 Redirecionando em <strong style={{ color: '#667eea', fontSize: '18px' }}>{contador}</strong> segundos...
          </div>

          {/* BOTÃO */}
          <button
            className="btn-public"
            onClick={() => {
              if (dados.lojaId) {
                navigate(`/public/loja/${dados.lojaId}`);
              } else {
                navigate('/');
              }
            }}
          >
            ← Voltar para Agendamentos
          </button>

          {/* DICA */}
          <p style={{
            marginTop: '30px',
            fontSize: '14px',
            color: '#999',
            textAlign: 'center'
          }}>
            💡 Salve este horário na sua agenda para não esquecer!
          </p>
        </div>
      </div>
    </div>
  );
}