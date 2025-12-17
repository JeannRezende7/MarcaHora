import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import '../styles/public-reset.css';  
import '../styles/public.css';  

export default function PublicHorarios() {
  const { lojaId, servicoId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loja, setLoja] = useState(null);
  const [servico, setServico] = useState(null);
  const [profissionais, setProfissionais] = useState([]);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(null);

  const dataParam = searchParams.get('data');
  const dataInicial = dataParam ? new Date(dataParam + 'T00:00:00') : new Date();
  
  const [mesAtual, setMesAtual] = useState(new Date(dataInicial.getFullYear(), dataInicial.getMonth(), 1));
  const [dataSelecionada, setDataSelecionada] = useState(dataInicial);
  const [horarios, setHorarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);

  function formatISO(date) {
    return date.toISOString().split("T")[0];
  }

  function mesAnterior() {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1));
  }

  function proximoMes() {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1));
  }

  function formatarMesAno(date) {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${meses[date.getMonth()]} ${date.getFullYear()}`;
  }

  function gerarDiasDoMes(mes) {
    const ano = mes.getFullYear();
    const mesNum = mes.getMonth();
    const primeiroDia = new Date(ano, mesNum, 1);
    const ultimoDia = new Date(ano, mesNum + 1, 0);
    
    const dias = [];
    
    // Dias do mês anterior para preencher
    const diaSemanaInicio = primeiroDia.getDay();
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      const dia = new Date(ano, mesNum, -i);
      dias.push({ data: dia, outroMes: true });
    }
    
    // Dias do mês atual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      dias.push({ data: new Date(ano, mesNum, dia), outroMes: false });
    }
    
    // Dias do próximo mês para completar
    const diasRestantes = 42 - dias.length;
    for (let i = 1; i <= diasRestantes; i++) {
      dias.push({ data: new Date(ano, mesNum + 1, i), outroMes: true });
    }
    
    return dias;
  }

  function isDiaPassado(date) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return date < hoje;
  }

  function diaPermitido(date) {
    const dow = date.getDay();
    const mapa = { 0: 7, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 };
    const dia = mapa[dow];

    if (!loja.diasFuncionamento || loja.diasFuncionamento.length === 0)
      return true;

    return loja.diasFuncionamento.includes(String(dia));
  }

  function isMesmaData(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  useEffect(() => {
    async function carregar() {
      try {
        const r = await api.get(`/public/loja/${lojaId}`);
        const dataLoja = r.data.loja;
        setLoja(dataLoja);

        if (dataLoja.usaServicos && servicoId !== "0") {
          const s = await api.get(`/api/servicos/${servicoId}`);
          setServico(s.data);
        }

        if (dataLoja.usaProfissionais) {
          const p = await api.get(`/api/profissionais/public/loja/${lojaId}`);
          setProfissionais(p.data || []);
        }

        setCarregando(false);
      } catch (e) {
        console.error("Erro ao carregar loja ou serviço", e);
        setCarregando(false);
      }
    }

    carregar();
  }, [lojaId, servicoId]);

  async function carregarHorarios(dia) {
    if (!loja) return;

    setCarregandoHorarios(true);

    const params = {
      lojaId,
      data: formatISO(dia)
    };

    if (loja.usaServicos && servicoId && servicoId !== "0") {
      params.servicoId = servicoId;
    }

    if (loja.usaProfissionais && profissionalSelecionado) {
      params.profissionalId = profissionalSelecionado;
    }

    try {
      const resp = await api.get("/public/agendamentos/horarios", { params });
      setHorarios(resp.data.horarios || []);
    } catch (e) {
      console.error("Erro ao buscar horários", e);
      setHorarios([]);
    } finally {
      setCarregandoHorarios(false);
    }
  }

  useEffect(() => {
    if (loja && dataSelecionada) carregarHorarios(dataSelecionada);
  }, [dataSelecionada, profissionalSelecionado, loja]);

  function selecionarDia(diaObj) {
    if (isDiaPassado(diaObj.data) || !diaPermitido(diaObj.data)) return;
    setDataSelecionada(diaObj.data);
  }

  function selecionarHorario(horarioStr) {
    const dataISO = formatISO(dataSelecionada);
    const dataHoraCompleta = `${dataISO}T${horarioStr}`;
    
    const params = new URLSearchParams();
    if (profissionalSelecionado) {
      params.set('profissionalId', profissionalSelecionado);
    }
    
    const query = params.toString();
    const url = query 
      ? `/public/confirmar/${lojaId}/${servicoId}/${encodeURIComponent(dataHoraCompleta)}?${query}`
      : `/public/confirmar/${lojaId}/${servicoId}/${encodeURIComponent(dataHoraCompleta)}`;
    
    navigate(url);
  }

  if (carregando) {
    return (
      <div className="public-container">
        <div className="loading-public">
          <div className="loading-icon-public">⏳</div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!loja) {
    return (
      <div className="public-container">
        <div className="public-card">
          <h2>❌ Loja não encontrada</h2>
        </div>
      </div>
    );
  }

  const diasDoMes = gerarDiasDoMes(mesAtual);

  return (
    <div className="public-container">
      <div className="public-wrapper">
        
        {/* HEADER DA LOJA */}
        <div className="loja-header">
          {loja.logoUrl && (
            <img src={loja.logoUrl} alt={loja.nome} className="loja-logo" />
          )}
          <h1 className="loja-nome">{loja.nome}</h1>
          <div className="loja-info">
            {loja.telefone && <span>📞 {loja.telefone}</span>}
            {loja.email && <span>📧 {loja.email}</span>}
          </div>
        </div>

        {/* CARD PRINCIPAL */}
        <div className="public-card">
          
          {/* INFO DO SERVIÇO */}
          {servico && (
            <div className="servico-info-card">
              <h2>✨ {servico.nome || servico.descricao}</h2>
              <div className="servico-detalhes">
                {servico.preco && (
                  <span>💰 R$ {servico.preco.toFixed(2)}</span>
                )}
                {servico.duracaoMinutos && (
                  <span>⏱️ {servico.duracaoMinutos} minutos</span>
                )}
              </div>
            </div>
          )}

          <h2>📅 Escolha a Data e Horário</h2>

          {/* SELECT DE PROFISSIONAL */}
          {loja.usaProfissionais && profissionais.length > 0 && (
            <div className="form-group-public">
              <label className="form-label-public">👤 Profissional</label>
              <select
                className="form-input-public"
                value={profissionalSelecionado || ""}
                onChange={(e) => setProfissionalSelecionado(e.target.value)}
              >
                <option value="">Selecione um profissional</option>
                {profissionais.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* CALENDÁRIO */}
          <div className="calendario-container">
            <div className="calendario-header">
              <button className="btn-nav-calendar" onClick={mesAnterior}>◀</button>
              <div className="calendario-mes">{formatarMesAno(mesAtual)}</div>
              <button className="btn-nav-calendar" onClick={proximoMes}>▶</button>
            </div>

            <div className="calendario-grid">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
                <div key={dia} className="dia-semana">{dia}</div>
              ))}
              
              {diasDoMes.map((diaObj, idx) => {
                const isPassado = isDiaPassado(diaObj.data);
                const isPermitido = diaPermitido(diaObj.data);
                const isSelecionado = isMesmaData(diaObj.data, dataSelecionada);
                
                let classes = 'dia-mes';
                if (diaObj.outroMes) classes += ' outro-mes';
                if (isSelecionado) classes += ' selected';
                if (isPassado || !isPermitido) classes += ' disabled';

                return (
                  <div
                    key={idx}
                    className={classes}
                    onClick={() => selecionarDia(diaObj)}
                  >
                    {diaObj.data.getDate()}
                  </div>
                );
              })}
            </div>
          </div>

          {/* HORÁRIOS */}
          {dataSelecionada && diaPermitido(dataSelecionada) && !isDiaPassado(dataSelecionada) && (
            <>
              <h3 style={{ marginTop: '24px', marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                🕐 Horários Disponíveis
              </h3>

              {carregandoHorarios ? (
                <div className="loading-public">
                  <div className="loading-icon-public">⏳</div>
                  <p>Carregando horários...</p>
                </div>
              ) : horarios.length === 0 ? (
                <div className="empty-state-public">
                  <div className="empty-icon-public">📭</div>
                  <p>Nenhum horário disponível para esta data.</p>
                </div>
              ) : (
                <div className="horarios-grid">
                  {horarios.map((horarioStr, idx) => (
                    <button
                      key={idx}
                      className="horario-slot"
                      onClick={() => selecionarHorario(horarioStr)}
                    >
                      {horarioStr}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* BOTÃO VOLTAR */}
          <button 
            className="btn-secondary-public"
            onClick={() => navigate(`/public/loja/${lojaId}`)}
          >
            ← Voltar
          </button>
        </div>

        {/* INFO RODAPÉ */}
        <div style={{
          background: '#f9fafb',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#6b7280',
          border: '1px solid #e5e7eb'
        }}>
          💡 Selecione uma data no calendário e depois escolha o horário desejado.
        </div>
      </div>
    </div>
  );
}