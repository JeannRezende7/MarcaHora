import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/geral.css";

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

  // ================================
  // CARREGAR INFORMAÇÕES DA LOJA
  // ================================
  useEffect(() => {
    async function load() {
      try {
        const resp = await api.get(`/public/loja/${id}`);
        if (resp.data.status !== "online") {
          setErro("Loja indisponível.");
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
        setErro("Erro ao carregar loja.");
        setCarregando(false);
      }
    }

    load();
  }, [id]);

  // ================================
  // GERAR CALENDÁRIO
  // ================================
  function gerarCalendario() {
    const primeiroDia = new Date(anoAtual, mesAtual, 1);
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);

    const calendario = [];

    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const data = new Date(anoAtual, mesAtual, dia);
      const diaSemana = data.getDay(); // 0-dom,1-seg,...

      // Conversão: loja usa 1=seg ... 7=dom
      const diaLoja = diaSemana === 0 ? 7 : diaSemana;

      const aberto = diasAbertos.includes(diaLoja);

      calendario.push({
        dia,
        data,
        aberto
      });
    }

    return calendario;
  }

  // ================================
  // NAVEGAR PARA A ESCOLHA DE HORÁRIOS
  // ================================
  function escolherDia(data) {
    const iso = data.toISOString().split("T")[0];
    navigate(`/public/loja/${id}/servico/0?data=${iso}`);
  }

  // Se loja usa serviços:
  function escolherServico(servicoId) {
    navigate(`/public/loja/${id}/servico/${servicoId}`);
  }

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril",
    "Maio", "Junho", "Julho", "Agosto",
    "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  if (carregando) return <div className="carregando">Carregando...</div>;
  if (erro) return <div className="erro">{erro}</div>;
  if (!loja) return <div>Loja não encontrada</div>;

  const calendario = gerarCalendario();

  return (
    <div className="public-container">

      {/* Cabeçalho da Loja */}
      <h1>{loja.nome}</h1>
      <p>{loja.telefone}</p>
      <p>{loja.email}</p>

      {/* SE A LOJA USA SERVIÇOS */}
      {loja.usaServicos && (
        <>
          <h2>Escolha um serviço</h2>

          <div className="lista-servicos">
            {servicos.map((serv) => (
              <div
                key={serv.id}
                className="servico-card"
                onClick={() => escolherServico(serv.id)}
              >
                <h3>{serv.nome}</h3>
                <p>Duração: {serv.duracaoMinutos} min</p>
                <p>R$ {serv.preco?.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* SE A LOJA NÃO USA SERVIÇOS */}
      {!loja.usaServicos && (
        <>
          <h2>Selecione o dia</h2>

          <div className="mes-controle">
            <button onClick={() => setMesAtual(mesAtual - 1)}>◀</button>
            <span>{meses[mesAtual]} / {anoAtual}</span>
            <button onClick={() => setMesAtual(mesAtual + 1)}>▶</button>
          </div>

          {/* Calendário */}
          <div className="calendario">
            {calendario.map((c, idx) => (
              <div
                key={idx}
                className={`dia ${c.aberto ? "aberto" : "fechado"}`}
                onClick={() => c.aberto && escolherDia(c.data)}
              >
                {c.dia}
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
