import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";

export default function Dashboard() {
  const { lojaId, usuario } = useAuth();
  const navigate = useNavigate();
  
  const [agendamentosHoje, setAgendamentosHoje] = useState([]);
  const [linkPublico, setLinkPublico] = useState("");
  const [estatisticas, setEstatisticas] = useState({
    totalClientes: 0,
    totalServicos: 0,
    agendamentosMes: 0
  });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!lojaId) return;
    carregarDados();
  }, [lojaId]);

  async function carregarDados() {
    try {
      const hoje = new Date().toISOString().split("T")[0];

      // Agendamentos de hoje
      const respAgendamentos = await api.get(`/api/agendamentos/loja/${lojaId}/data?data=${hoje}`);
      setAgendamentosHoje(respAgendamentos.data || []);

      // Estatísticas
      try {
        const [respClientes, respServicos] = await Promise.all([
          api.get(`/api/clientes/loja/${lojaId}`),
          api.get(`/api/servicos/loja/${lojaId}`)
        ]);

        setEstatisticas({
          totalClientes: respClientes.data?.length || 0,
          totalServicos: respServicos.data?.length || 0,
          agendamentosMes: 0
        });
      } catch (err) {
        console.log("Erro ao carregar estatísticas:", err);
      }

      setLinkPublico(`${window.location.origin}/public/loja/${lojaId}`);
      setCarregando(false);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setCarregando(false);
    }
  }

  function copiarLink() {
    navigator.clipboard.writeText(linkPublico);
    alert("Link copiado para a área de transferência!");
  }

  function formatarHora(dataHora) {
    if (!dataHora) return "--:--";
    try {
      return new Date(dataHora).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return "--:--";
    }
  }

  if (carregando) {
    return (
      <div className="dashboard">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px' }}>⏳</div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">

      {/* Saudação */}
      <h2 className="titulo">
        👋 Bem-vindo!
      </h2>

      {/* KPIs */}
      <div className="kpi-row">
        
        <div className="kpi-card kpi-purple">
          <div className="kpi-icon-modern">📅</div>
          <div className="kpi-content">
            <span className="kpi-label">Agendamentos Hoje</span>
            <span className="kpi-value">{agendamentosHoje.length}</span>
          </div>
        </div>

        <div className="kpi-card kpi-green">
          <div className="kpi-icon-modern">👥</div>
          <div className="kpi-content">
            <span className="kpi-label">Total de Clientes</span>
            <span className="kpi-value">{estatisticas.totalClientes}</span>
          </div>
        </div>

        <div className="kpi-card kpi-orange">
          <div className="kpi-icon-modern">🔧</div>
          <div className="kpi-content">
            <span className="kpi-label">Serviços Cadastrados</span>
            <span className="kpi-value">{estatisticas.totalServicos}</span>
          </div>
        </div>

      </div>

      {/* Link Público */}
      <div className="section">
        <h3>🔗 Link de Agendamento</h3>
        <p style={{ color: '#777', marginBottom: '16px', fontSize: '14px' }}>
          Compartilhe este link com seus clientes para que eles possam agendar online
        </p>
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <input
            className="kpi-input"
            type="text"
            readOnly
            value={linkPublico}
            style={{ 
              flex: 1, 
              minWidth: '300px',
              background: 'white',
              color: '#333',
              border: '2px solid #e0e0e0'
            }}
          />
          <button 
            onClick={copiarLink}
            style={{
              padding: '12px 24px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#5568d3'}
            onMouseOut={(e) => e.target.style.background = '#667eea'}
          >
            📋 Copiar Link
          </button>
        </div>
      </div>

      {/* Agendamentos de Hoje */}
      <div className="section">
        <div className="section-header">
          <h3>📅 Agendamentos de Hoje</h3>
          <button 
            className="btn-light"
            onClick={() => navigate('/agendamentos')}
          >
            Ver Todos
          </button>
        </div>

        {agendamentosHoje.length === 0 ? (
          <div className="card-empty">
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
            <p style={{ fontSize: '16px', color: '#999' }}>
              Nenhum agendamento para hoje
            </p>
            <p style={{ fontSize: '14px', color: '#bbb', marginTop: '8px' }}>
              Compartilhe seu link para receber agendamentos
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gap: '12px',
            marginTop: '20px'
          }}>
            {agendamentosHoje.slice(0, 5).map((ag) => (
              <div key={ag.id} style={{
                background: 'white',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #f0f0f0',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: '16px',
                alignItems: 'center',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{
                  background: '#f5f6fa',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  minWidth: '80px'
                }}>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: '700',
                    color: '#667eea'
                  }}>
                    {formatarHora(ag.dataHora)}
                  </div>
                </div>

                <div>
                  <div style={{ 
                    fontWeight: '600', 
                    fontSize: '16px',
                    marginBottom: '4px'
                  }}>
                    {ag.cliente?.nome || 'Cliente'}
                  </div>
                  <div style={{ 
                    fontSize: '14px',
                    color: '#777',
                    marginBottom: '4px'
                  }}>
                    {ag.servico?.nome || ag.servico?.descricao || 'Serviço'}
                  </div>
                  {ag.profissional && (
                    <div style={{ 
                      fontSize: '13px',
                      color: '#999'
                    }}>
                      👤 {ag.profissional.nome}
                    </div>
                  )}
                </div>

                <div style={{
                  background: '#4caf50',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {ag.status || 'AGENDADO'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid Inferior */}
      <div className="bottom-grid">

        {/* Ações Rápidas */}
        <div className="card">
          <h3>⚡ Ações Rápidas</h3>
          <button 
            className="btn-purple"
            onClick={() => navigate('/agendamentos')}
          >
            📅 Ver Agenda
          </button>
          <button 
            className="btn-green"
            onClick={() => navigate('/servicos')}
          >
            ⚙️ Gerenciar Serviços
          </button>
        </div>

        {/* Dicas */}
        <div className="card">
          <h3>💡 Dicas para Crescer</h3>
          <ul className="tips">
            <li>✅ Compartilhe o link nas redes sociais</li>
            <li>✅ Configure horários de funcionamento</li>
            <li>✅ Cadastre todos os seus serviços</li>
          </ul>
        </div>

      </div>
    </div>
  );
}