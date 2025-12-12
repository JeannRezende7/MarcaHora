import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import "../styles/public.css";

export default function PublicHorarios() {
  const { lojaId, servicoId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loja, setLoja] = useState(null);
  const [servico, setServico] = useState(null);
  const [profissionais, setProfissionais] = useState([]);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(null);

  // Inicializa a data com o parâmetro da URL ou com hoje
  const dataParam = searchParams.get('data');
  const dataInicial = dataParam ? new Date(dataParam + 'T00:00:00') : new Date();
  
  const [data, setData] = useState(dataInicial);
  const [horarios, setHorarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);

  // Converte para yyyy-MM-dd
  function formatISO(date) {
    return date.toISOString().split("T")[0];
  }

  function addDays(dt, amount) {
    const copy = new Date(dt);
    copy.setDate(copy.getDate() + amount);
    return copy;
  }

  // Formata data para exibição
  function formatarData(date) {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    return `${dias[date.getDay()]}, ${date.getDate()} de ${meses[date.getMonth()]}`;
  }

  // Carregar dados da loja + serviço (se houver)
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

  // Buscar horarios do dia
  async function carregarHorarios(dia) {
    if (!loja) return;

    setCarregandoHorarios(true);

    const params = {
      lojaId,
      data: formatISO(dia)
    };

    // Só envia servicoId se a loja usa serviços E o servicoId não é 0
    if (loja.usaServicos && servicoId && servicoId !== "0") {
      params.servicoId = servicoId;
    }

    if (loja.usaProfissionais && profissionalSelecionado) {
      params.profissionalId = profissionalSelecionado;
    }

    console.log("Buscando horários com params:", params);

    try {
      const resp = await api.get("/public/agendamentos/horarios", { params });
      console.log("Resposta do backend:", resp.data);
      setHorarios(resp.data.horarios || []);
    } catch (e) {
      console.error("Erro ao buscar horários", e);
      setHorarios([]);
    } finally {
      setCarregandoHorarios(false);
    }
  }

  // Recarregar horários quando mudar data ou profissional
  useEffect(() => {
    if (loja) carregarHorarios(data);
  }, [data, profissionalSelecionado, loja]);

  if (carregando) {
    return (
      <div className="public-container">
        <div className="loading">⏳ Carregando...</div>
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

  // Verificar dia permitido
  function diaPermitido(date) {
    const dow = date.getDay(); // 0 = domingo
    const mapa = { 0: 7, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 };
    const dia = mapa[dow];

    if (!loja.diasFuncionamento || loja.diasFuncionamento.length === 0)
      return true;

    return loja.diasFuncionamento.includes(String(dia));
  }

  // Formatar horário para exibição e criar datetime completo
  function selecionarHorario(horarioStr) {
    // horarioStr vem como "14:30" do backend
    // Precisamos criar o datetime completo: "2025-12-10T14:30"
    const dataISO = formatISO(data);
    const dataHoraCompleta = `${dataISO}T${horarioStr}`;
    
    navigate(`/public/confirmar/${lojaId}/${servicoId}/${encodeURIComponent(dataHoraCompleta)}`);
  }

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
          
          {/* INFORMAÇÕES DO SERVIÇO */}
          {servico && (
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '20px',
              borderRadius: '12px',
              color: 'white',
              marginBottom: '30px'
            }}>
              <h2 style={{ color: 'white', marginBottom: '12px' }}>
                ✨ {servico.nome || servico.descricao}
              </h2>
              <div style={{ 
                display: 'flex', 
                gap: '20px', 
                fontSize: '16px',
                flexWrap: 'wrap'
              }}>
                {servico.preco && (
                  <span style={{ fontWeight: '600' }}>
                    💰 R$ {servico.preco.toFixed(2)}
                  </span>
                )}
                {servico.duracaoMinutos && (
                  <span>⏱️ {servico.duracaoMinutos} minutos</span>
                )}
              </div>
            </div>
          )}

          {/* TÍTULO */}
          <h2>📅 Escolha o Horário</h2>

          {/* PROFISSIONAIS */}
          {loja.usaProfissionais && profissionais.length > 0 && (
            <div className="form-group-public">
              <label>👤 Profissional</label>
              <select
                value={profissionalSelecionado || ""}
                onChange={(e) => setProfissionalSelecionado(e.target.value)}
                className="form-group-public select"
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

          {/* NAVEGAÇÃO DE DATA */}
          <div className="calendario-header">
            <div className="calendario-mes">
              {formatarData(data)}
            </div>
            <div className="calendario-nav">
              <button 
                className="btn-nav" 
                onClick={() => setData(addDays(data, -1))}
                title="Dia anterior"
              >
                ◀
              </button>
              <button 
                className="btn-nav"
                onClick={() => setData(new Date())}
                title="Hoje"
              >
                •
              </button>
              <button 
                className="btn-nav"
                onClick={() => setData(addDays(data, 1))}
                title="Próximo dia"
              >
                ▶
              </button>
            </div>
          </div>

          {/* ALERTA DIA FECHADO */}
          {!diaPermitido(data) && (
            <div className="erro-mensagem">
              🔒 A loja está fechada neste dia. Por favor, escolha outra data.
            </div>
          )}

          {/* HORÁRIOS DISPONÍVEIS */}
          {diaPermitido(data) && (
            <>
              <h3 style={{ marginTop: '30px', marginBottom: '20px' }}>
                🕐 Horários Disponíveis
              </h3>

              {carregandoHorarios ? (
                <div style={{
                  background: '#f5f6fa',
                  padding: '40px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  color: '#999'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
                  <p style={{ fontSize: '16px', margin: 0 }}>
                    Carregando horários...
                  </p>
                </div>
              ) : horarios.length === 0 ? (
                <div style={{
                  background: '#f5f6fa',
                  padding: '40px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  color: '#999'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                  <p style={{ fontSize: '16px', margin: 0 }}>
                    Nenhum horário disponível para esta data.
                  </p>
                  <p style={{ fontSize: '14px', marginTop: '8px', color: '#bbb' }}>
                    Tente outro dia ou entre em contato conosco.
                  </p>
                </div>
              ) : (
                <div className="horarios-grid">
                  {horarios.map((horarioStr, idx) => (
                    <button
                      key={idx}
                      className="horario-option"
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
            className="btn-voltar" 
            onClick={() => navigate(`/public/loja/${lojaId}`)}
            style={{ marginTop: '30px' }}
          >
            ← Voltar
          </button>
        </div>

        {/* INFORMAÇÕES ADICIONAIS */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#666'
        }}>
          <p style={{ margin: 0 }}>
            💡 Após escolher o horário, você confirmará seus dados e finalizará o agendamento.
          </p>
        </div>
      </div>
    </div>
  );
}