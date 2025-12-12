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

  const statusCores = {
    'AGENDADO': '#4caf50',
    'CONFIRMADO': '#2196f3',
    'CANCELADO': '#f44336',
    'CONCLUIDO': '#9c27b0'
  };

  return (
    <div className="page">
      <h1>📅 Agendamentos</h1>

      {/* Controles */}
      <div className="agendamentos-controles">
        <div className="filtro-data">
          <label>Data:</label>
          <input 
            type="date" 
            value={data} 
            onChange={(e) => setData(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn-hoje"
            onClick={() => mudarDia(-1)}
          >
            ← Anterior
          </button>
          <button 
            className="btn-hoje"
            onClick={irParaHoje}
          >
            Hoje
          </button>
          <button 
            className="btn-hoje"
            onClick={() => mudarDia(1)}
          >
            Próximo →
          </button>
        </div>

        <div className="filtro-data">
          <label>Status:</label>
          <select 
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            style={{
              padding: '10px 14px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '15px'
            }}
          >
            <option value="TODOS">Todos</option>
            <option value="AGENDADO">Agendado</option>
            <option value="CONFIRMADO">Confirmado</option>
            <option value="CANCELADO">Cancelado</option>
            <option value="CONCLUIDO">Concluído</option>
          </select>
        </div>
      </div>

      {/* Data Selecionada */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{ 
          fontSize: '18px', 
          fontWeight: '600',
          color: '#333',
          textTransform: 'capitalize'
        }}>
          {formatarData(data)}
        </div>
        <div style={{ 
          fontSize: '14px',
          color: '#777',
          marginTop: '4px'
        }}>
          {listaFiltrada.length} agendamento(s) {filtroStatus !== 'TODOS' && `· Status: ${filtroStatus}`}
        </div>
      </div>

      {/* Loading */}
      {carregando && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px',
          background: 'white',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#999' }}>Carregando agendamentos...</p>
        </div>
      )}

      {/* Lista Vazia */}
      {!carregando && listaFiltrada.length === 0 && (
        <div className="agendamentos-vazio">
          <div className="agendamentos-vazio-icon">📭</div>
          <p>Nenhum agendamento encontrado</p>
          <small style={{ color: '#bbb', display: 'block', marginTop: '8px' }}>
            {filtroStatus !== 'TODOS' 
              ? 'Tente outro filtro ou data' 
              : 'Nenhum agendamento para esta data'}
          </small>
        </div>
      )}

      {/* Lista de Agendamentos */}
      {!carregando && listaFiltrada.length > 0 && (
        <div className="agendamentos-lista">
          {listaFiltrada.map((ag) => (
            <div key={ag.id} className="agendamento-card">
              
              {/* Horário */}
              <div className="agendamento-horario">
                <div className="agendamento-hora">
                  {formatarHora(ag.dataHora)}
                </div>
              </div>

              {/* Informações */}
              <div className="agendamento-info">
                <div className="agendamento-cliente">
                  {ag.cliente?.nome || 'Cliente'}
                </div>
                {ag.servico && (
                  <div className="agendamento-servico">
                    {ag.servico.nome || ag.servico.descricao}
                  </div>
                )}
                <div className="agendamento-detalhes">
                  {ag.profissional && (
                    <span>👤 {ag.profissional.nome}</span>
                  )}
                  {ag.cliente?.telefone && (
                    <span>📱 {ag.cliente.telefone}</span>
                  )}
                  {ag.cliente?.email && (
                    <span>📧 {ag.cliente.email}</span>
                  )}
                </div>
                {ag.observacoes && (
                  <div style={{ 
                    marginTop: '8px',
                    fontSize: '13px',
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    💬 {ag.observacoes}
                  </div>
                )}
              </div>

              {/* Status e Ações */}
              <div className="agendamento-status">
                <div 
                  className="badge"
                  style={{ 
                    background: statusCores[ag.status] || '#999'
                  }}
                >
                  {ag.status || 'AGENDADO'}
                </div>

                <div className="agendamento-acoes">
                  <button 
                    className="btn-icon btn-visualizar"
                    title="Ver detalhes"
                  >
                    👁️
                  </button>
                  {ag.status !== 'CANCELADO' && (
                    <button 
                      className="btn-icon btn-cancelar"
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