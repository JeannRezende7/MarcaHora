import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/agendamentos.css";

export default function Agenda() {
  const { lojaId } = useAuth();
  const [mesAtual, setMesAtual] = useState(new Date().getMonth());
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState(null);

  useEffect(() => {
    if (!lojaId) return;
    carregarAgendamentosMes();
  }, [lojaId, mesAtual, anoAtual]);

  async function carregarAgendamentosMes() {
    setCarregando(true);
    try {
      // Carregar todos os agendamentos do mês
      const primeiroDia = new Date(anoAtual, mesAtual, 1).toISOString().split("T")[0];
      const ultimoDia = new Date(anoAtual, mesAtual + 1, 0).toISOString().split("T")[0];
      
      const resp = await api.get(`/api/agendamentos/loja/${lojaId}`);
      
      // Filtrar agendamentos do mês
      const agendamentosMes = (resp.data || []).filter(ag => {
        const dataAg = ag.dataHora.split("T")[0];
        return dataAg >= primeiroDia && dataAg <= ultimoDia;
      });
      
      setAgendamentos(agendamentosMes);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
      setAgendamentos([]);
    } finally {
      setCarregando(false);
    }
  }

  function mudarMes(delta) {
    let novoMes = mesAtual + delta;
    let novoAno = anoAtual;

    if (novoMes > 11) {
      novoMes = 0;
      novoAno++;
    } else if (novoMes < 0) {
      novoMes = 11;
      novoAno--;
    }

    setMesAtual(novoMes);
    setAnoAtual(novoAno);
    setDiaSelecionado(null);
  }

  function irParaHoje() {
    const hoje = new Date();
    setMesAtual(hoje.getMonth());
    setAnoAtual(hoje.getFullYear());
    setDiaSelecionado(hoje.getDate());
  }

  function gerarCalendario() {
    const primeiroDia = new Date(anoAtual, mesAtual, 1);
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
    const diaSemanaInicial = primeiroDia.getDay();

    const calendario = [];

    // Dias vazios do início
    for (let i = 0; i < diaSemanaInicial; i++) {
      calendario.push({ vazio: true });
    }

    // Dias do mês
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const data = new Date(anoAtual, mesAtual, dia);
      const dataISO = data.toISOString().split("T")[0];
      
      // Contar agendamentos do dia
      const agsDia = agendamentos.filter(ag => 
        ag.dataHora.split("T")[0] === dataISO
      );

      const hoje = new Date();
      const ehHoje = 
        dia === hoje.getDate() &&
        mesAtual === hoje.getMonth() &&
        anoAtual === hoje.getFullYear();

      calendario.push({
        dia,
        data,
        ehHoje,
        agendamentos: agsDia.length
      });
    }

    return calendario;
  }

  function getAgendamentosDia(dia) {
    const data = new Date(anoAtual, mesAtual, dia);
    const dataISO = data.toISOString().split("T")[0];
    
    return agendamentos
      .filter(ag => ag.dataHora.split("T")[0] === dataISO)
      .sort((a, b) => a.dataHora.localeCompare(b.dataHora));
  }

  function formatarHora(dataHora) {
    try {
      return new Date(dataHora).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return "--:--";
    }
  }

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril",
    "Maio", "Junho", "Julho", "Agosto",
    "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const calendario = gerarCalendario();
  const agendamentosDia = diaSelecionado ? getAgendamentosDia(diaSelecionado) : [];

  return (
    <div className="page">
      <h1>📅 Agenda</h1>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
        marginTop: '24px'
      }}>

        {/* CALENDÁRIO */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          
          {/* Navegação do Mês */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <button
              onClick={() => mudarMes(-1)}
              style={{
                padding: '8px 16px',
                background: '#f5f6fa',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              ← Anterior
            </button>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}>
              <h2 style={{ 
                margin: 0,
                fontSize: '24px',
                fontWeight: '700'
              }}>
                {meses[mesAtual]} {anoAtual}
              </h2>
              <button
                onClick={irParaHoje}
                style={{
                  padding: '4px 12px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Ir para Hoje
              </button>
            </div>

            <button
              onClick={() => mudarMes(1)}
              style={{
                padding: '8px 16px',
                background: '#f5f6fa',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Próximo →
            </button>
          </div>

          {/* Grid do Calendário */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px'
          }}>
            {/* Dias da semana */}
            {diasSemana.map((dia) => (
              <div
                key={dia}
                style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#999',
                  padding: '8px 0'
                }}
              >
                {dia}
              </div>
            ))}

            {/* Dias do mês */}
            {calendario.map((item, idx) => {
              if (item.vazio) {
                return <div key={`vazio-${idx}`} />;
              }

              const selecionado = item.dia === diaSelecionado;
              
              return (
                <div
                  key={idx}
                  onClick={() => setDiaSelecionado(item.dia)}
                  style={{
                    aspectRatio: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: item.ehHoje 
                      ? '#667eea' 
                      : selecionado 
                        ? '#f0f2ff' 
                        : 'white',
                    border: selecionado ? '2px solid #667eea' : '1px solid #f0f0f0',
                    color: item.ehHoje ? 'white' : '#333',
                    fontWeight: item.ehHoje || selecionado ? '700' : '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (!item.ehHoje && !selecionado) {
                      e.currentTarget.style.background = '#f5f6fa';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!item.ehHoje && !selecionado) {
                      e.currentTarget.style.background = 'white';
                    }
                  }}
                >
                  <div style={{ fontSize: '16px' }}>{item.dia}</div>
                  {item.agendamentos > 0 && (
                    <div style={{
                      marginTop: '4px',
                      fontSize: '10px',
                      background: item.ehHoje ? 'white' : '#667eea',
                      color: item.ehHoje ? '#667eea' : 'white',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontWeight: '700'
                    }}>
                      {item.agendamentos}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* LISTA DE AGENDAMENTOS DO DIA */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          maxHeight: '600px',
          overflowY: 'auto'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
            {diaSelecionado 
              ? `Dia ${diaSelecionado}` 
              : 'Selecione um dia'}
          </h3>

          {!diaSelecionado ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              color: '#999'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>👈</div>
              <p>Clique em um dia do calendário para ver os agendamentos</p>
            </div>
          ) : agendamentosDia.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              color: '#999'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
              <p>Nenhum agendamento neste dia</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {agendamentosDia.map((ag) => (
                <div
                  key={ag.id}
                  style={{
                    padding: '16px',
                    background: '#f5f6fa',
                    borderRadius: '8px',
                    borderLeft: '4px solid #667eea'
                  }}
                >
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '700',
                    color: '#667eea',
                    marginBottom: '8px'
                  }}>
                    {formatarHora(ag.dataHora)}
                  </div>
                  <div style={{ 
                    fontSize: '15px',
                    fontWeight: '600',
                    marginBottom: '4px'
                  }}>
                    {ag.cliente?.nome || 'Cliente'}
                  </div>
                  {ag.servico && (
                    <div style={{ 
                      fontSize: '13px',
                      color: '#777'
                    }}>
                      {ag.servico.nome || ag.servico.descricao}
                    </div>
                  )}
                  {ag.status && (
                    <div style={{
                      marginTop: '8px',
                      display: 'inline-block',
                      padding: '4px 8px',
                      background: ag.status === 'CANCELADO' ? '#f44336' : '#4caf50',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {ag.status}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
