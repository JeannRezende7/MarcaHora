import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/agendamentos.css";

export default function Agendamentos() {
  const { lojaId } = useAuth();
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("TODOS");

  useEffect(() => {
    if (!lojaId) return;
    carregarAgendamentos();
  }, [data, lojaId]);

  async function carregarAgendamentos() {
    setCarregando(true);
    try {
      const resp = await api.get(`/api/agendamentos/loja/${lojaId}/data?data=${data}`);
      setLista(resp.data || []);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
      setLista([]);
    } finally {
      setCarregando(false);
    }
  }

  function formatarData(dataStr) {
    const date = new Date(dataStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  function mudarDia(dias) {
    const novaData = new Date(data + 'T00:00:00');
    novaData.setDate(novaData.getDate() + dias);
    setData(novaData.toISOString().split("T")[0]);
  }

  function irParaHoje() {
    setData(new Date().toISOString().split("T")[0]);
  }

  const listaFiltrada = filtroStatus === "TODOS" 
    ? lista 
    : lista.filter(ag => ag.status === filtroStatus);

  const statusInfo = {
    'AGENDADO': { cor: '#10b981', bg: '#f0fdf4' },
    'CONFIRMADO': { cor: '#3b82f6', bg: '#eff6ff' },
    'CANCELADO': { cor: '#ef4444', bg: '#fef2f2' },
    'CONCLUIDO': { cor: '#8b5cf6', bg: '#f5f3ff' }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>📅 Agendamentos</h1>
        <p className="page-subtitle">Gerencie os agendamentos da sua loja</p>
      </div>

      {/* Controles Modernos */}
      <div className="agendamentos-controles-modern">
        <div className="controle-group">
          <label className="controle-label">Data</label>
          <input 
            type="date" 
            value={data} 
            onChange={(e) => setData(e.target.value)}
            className="input-modern"
          />
        </div>

        <div className="controle-nav">
          <button 
            className="btn-nav"
            onClick={() => mudarDia(-1)}
          >
            ← Anterior
          </button>
          <button 
            className="btn-today"
            onClick={irParaHoje}
          >
            Hoje
          </button>
          <button 
            className="btn-nav"
            onClick={() => mudarDia(1)}
          >
            Próximo →
          </button>
        </div>

        <div className="controle-group">
          <label className="controle-label">Status</label>
          <select 
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="select-modern"
          >
            <option value="TODOS">Todos</option>
            <option value="AGENDADO">Agendado</option>
            <option value="CONFIRMADO">Confirmado</option>
            <option value="CANCELADO">Cancelado</option>
            <option value="CONCLUIDO">Concluído</option>
          </select>
        </div>
      </div>

      {/* Info Card */}
      <div className="info-card">
        <div className="info-main">
          {formatarData(data)}
        </div>
        <div className="info-sub">
          {listaFiltrada.length} agendamento(s) {filtroStatus !== 'TODOS' && `· ${filtroStatus}`}
        </div>
      </div>

      {/* Loading */}
      {carregando && (
        <div className="loading-state">
          <div className="loading-icon">⏳</div>
          <p>Carregando agendamentos...</p>
        </div>
      )}

      {/* Lista Vazia */}
      {!carregando && listaFiltrada.length === 0 && (
        <div className="empty-state-modern">
          <div className="empty-icon">📭</div>
          <h3>Nenhum agendamento encontrado</h3>
          <p>
            {filtroStatus !== 'TODOS' 
              ? 'Tente outro filtro ou data' 
              : 'Nenhum agendamento para esta data'}
          </p>
        </div>
      )}

      {/* Lista de Agendamentos */}
      {!carregando && listaFiltrada.length > 0 && (
        <div className="agendamentos-grid">
          {listaFiltrada.map((ag) => (
            <div key={ag.id} className="agendamento-card-modern">
              
              {/* Horário */}
              <div className="card-time">
                <div className="time-badge">
                  {formatarHora(ag.dataHora)}
                </div>
              </div>

              {/* Conteúdo */}
              <div className="card-content">
                <h3 className="card-title">
                  {ag.cliente?.nome || 'Cliente'}
                </h3>
                
                {ag.servico && (
                  <div className="card-service">
                    {ag.servico.nome || ag.servico.descricao}
                  </div>
                )}

                <div className="card-details">
                  {ag.profissional && (
                    <span className="detail-item">
                      <span className="detail-icon">👤</span>
                      {ag.profissional.nome}
                    </span>
                  )}
                  {ag.cliente?.telefone && (
                    <span className="detail-item">
                      <span className="detail-icon">📱</span>
                      {ag.cliente.telefone}
                    </span>
                  )}
                </div>

                {ag.observacoes && (
                  <div className="card-note">
                    💬 {ag.observacoes}
                  </div>
                )}
              </div>

              {/* Status e Ações */}
              <div className="card-footer">
                <span 
                  className="status-badge"
                  style={{ 
                    background: statusInfo[ag.status]?.bg || '#f3f4f6',
                    color: statusInfo[ag.status]?.cor || '#6b7280'
                  }}
                >
                  {ag.status || 'AGENDADO'}
                </span>

                <div className="card-actions">
                  <button 
                    className="btn-action"
                    title="Ver detalhes"
                  >
                    👁️
                  </button>
                  {ag.status !== 'CANCELADO' && (
                    <button 
                      className="btn-action btn-danger"
                      title="Cancelar"
                    >
                      ✖️
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}