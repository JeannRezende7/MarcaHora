import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import '../styles/public-reset.css';  
import '../styles/public.css';  

export default function PublicLoja() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loja, setLoja] = useState(null);
  const [servicos, setServicos] = useState([]);
  const [diasAbertos, setDiasAbertos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const hoje = new Date();
  const [mesAtual, setMesAtual] = useState(hoje.getMonth());
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());

  // Carregar informações da loja
  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get(`/public/loja/${id}`);
        if (resp.data.status !== "online") {
          setErro("Loja indisponível no momento.");
          setCarregando(false);
          return;
        }

        const lojaData = resp.data.loja;
        setLoja(lojaData);

        // Serviços (se usar serviços)
        if (lojaData.usaServicos) {
          setServicos(resp.data.servicos || []);
        }

        // Dias abertos → backend salva como "1,2,3,4,5" (seg–sex)
        const dias = lojaData.diasFuncionamento
          ? lojaData.diasFuncionamento.split(",").map(Number)
          : [];

        setDiasAbertos(dias);
        setCarregando(false);
      } catch (e) {
        console.error(e);
        setErro("Erro ao carregar informações da loja.");
        setCarregando(false);
      }
    }

    load();
  }, [id]);

  // Gerar calendário
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
      const diaSemana = data.getDay();
      const diaLoja = diaSemana === 0 ? 7 : diaSemana;
      const aberto = diasAbertos.includes(diaLoja);
      const passado = data < new Date().setHours(0, 0, 0, 0);

      calendario.push({
        dia,
        data,
        aberto,
        passado
      });
    }

    return calendario;
  }

  // Navegar para escolha de horários
  function escolherServico(servicoId) {
    navigate(`/public/horarios/${id}/${servicoId}`);
  }

  function escolherDia(dataObj) {
    // Formata a data e passa como parâmetro na URL
    const dataISO = dataObj.toISOString().split("T")[0];
    navigate(`/public/horarios/${id}/0?data=${dataISO}`);
  }

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril",
    "Maio", "Junho", "Julho", "Agosto",
    "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  if (carregando) {
    return (
      <div className="public-container">
        <div className="loading">⏳ Carregando...</div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="public-container">
        <div className="public-card">
          <h2>❌ {erro}</h2>
          <p style={{ color: '#777', marginTop: '16px' }}>
            Entre em contato conosco para mais informações.
          </p>
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

  const calendario = gerarCalendario();

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
            {loja.horarioAbertura && loja.horarioFechamento && (
              <span>
                🕐 {loja.horarioAbertura} - {loja.horarioFechamento}
              </span>
            )}
          </div>
        </div>

        {/* CARD PRINCIPAL */}
        <div className="public-card">
          
          {/* SE A LOJA USA SERVIÇOS */}
          {loja.usaServicos && servicos.length > 0 && (
            <>
              <h2>✨ Escolha um Serviço</h2>
              <p style={{ color: '#777', marginBottom: '24px' }}>
                Selecione o serviço desejado para continuar
              </p>

              <div className="servicos-grid">
                {servicos.map((serv) => (
                  <div
                    key={serv.id}
                    className="servico-option"
                    onClick={() => escolherServico(serv.id)}
                  >
                    <div className="servico-nome">{serv.nome}</div>
                    {serv.preco && (
                      <div className="servico-preco">
                        R$ {serv.preco.toFixed(2)}
                      </div>
                    )}
                    {serv.duracaoMinutos && (
                      <div className="servico-duracao">
                        ⏱️ {serv.duracaoMinutos} min
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* SE A LOJA NÃO USA SERVIÇOS - MOSTRAR CALENDÁRIO */}
          {!loja.usaServicos && (
            <>
              <h2>📅 Escolha uma Data</h2>
              <p style={{ color: '#777', marginBottom: '24px' }}>
                Clique no dia desejado para ver os horários disponíveis
              </p>

              {/* Navegação do Mês */}
              <div className="calendario-header">
                <div className="calendario-mes">
                  {meses[mesAtual]} {anoAtual}
                </div>
                <div className="calendario-nav">
                  <button
                    className="btn-nav"
                    onClick={() => {
                      if (mesAtual === 0) {
                        setMesAtual(11);
                        setAnoAtual(anoAtual - 1);
                      } else {
                        setMesAtual(mesAtual - 1);
                      }
                    }}
                  >
                    ◀
                  </button>
                  <button
                    className="btn-nav"
                    onClick={() => {
                      setMesAtual(hoje.getMonth());
                      setAnoAtual(hoje.getFullYear());
                    }}
                    title="Mês atual"
                  >
                    📅
                  </button>
                  <button
                    className="btn-nav"
                    onClick={() => {
                      if (mesAtual === 11) {
                        setMesAtual(0);
                        setAnoAtual(anoAtual + 1);
                      } else {
                        setMesAtual(mesAtual + 1);
                      }
                    }}
                  >
                    ▶
                  </button>
                </div>
              </div>

              {/* Calendário */}
              <div className="calendario">
                <div className="calendario-grid">
                  {/* Dias da semana */}
                  {diasSemana.map((dia) => (
                    <div key={dia} className="dia-semana">
                      {dia}
                    </div>
                  ))}
                  
                  {/* Dias do mês */}
                  {calendario.map((item, idx) => {
                    if (item.vazio) {
                      return <div key={`vazio-${idx}`} className="dia-mes disabled" />;
                    }

                    const classes = ['dia-mes'];
                    if (!item.aberto || item.passado) {
                      classes.push('disabled');
                    } else {
                      classes.push('disponivel');
                    }

                    return (
                      <div
                        key={idx}
                        className={classes.join(' ')}
                        onClick={() => {
                          if (item.aberto && !item.passado) {
                            console.log("Clicou no dia:", item.data);
                            escolherDia(item.data);
                          }
                        }}
                        style={{
                          cursor: item.aberto && !item.passado ? 'pointer' : 'not-allowed'
                        }}
                      >
                        {item.dia}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legenda */}
              <div style={{
                display: 'flex',
                gap: '20px',
                justifyContent: 'center',
                marginTop: '20px',
                fontSize: '14px',
                color: '#777',
                flexWrap: 'wrap'
              }}>
                <span>
                  <span style={{ 
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    background: '#f5f6fa',
                    borderRadius: '4px',
                    marginRight: '6px',
                    verticalAlign: 'middle'
                  }} />
                  Disponível
                </span>
                <span>
                  <span style={{ 
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    background: '#e0e0e0',
                    borderRadius: '4px',
                    marginRight: '6px',
                    verticalAlign: 'middle'
                  }} />
                  Indisponível
                </span>
              </div>
            </>
          )}
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
            💡 Agende seu horário de forma rápida e prática
          </p>
        </div>
      </div>
    </div>
  );
}
