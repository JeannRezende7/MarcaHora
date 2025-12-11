import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/geral.css";

export default function PublicHorarios() {
  const { lojaId, servicoId } = useParams();
  const navigate = useNavigate();

  const [loja, setLoja] = useState(null);
  const [servico, setServico] = useState(null);
  const [profissionais, setProfissionais] = useState([]);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(null);

  const [data, setData] = useState(new Date());
  const [horarios, setHorarios] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Converte para yyyy-MM-dd
  function formatISO(date) {
    return date.toISOString().split("T")[0];
  }

  function addDays(dt, amount) {
    const copy = new Date(dt);
    copy.setDate(copy.getDate() + amount);
    return copy;
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
          const p = await api.get(`/public/profissionais/${lojaId}`);
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

    const params = {
      lojaId,
      data: formatISO(dia)
    };

    if (loja.usaServicos) {
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
    }
  }

  // Recarregar horários quando mudar data ou profissional
  useEffect(() => {
    if (loja) carregarHorarios(data);
  }, [data, profissionalSelecionado, loja]);

  if (carregando) return <div className="carregando">Carregando...</div>;
  if (!loja) return <div>Loja não encontrada</div>;

  // Verificar dia permitido
  function diaPermitido(date) {
    const dow = date.getDay(); // 0 = domingo
    const mapa = { 0: 7, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 };
    const dia = mapa[dow]; // converte para padrão backend

    if (!loja.diasFuncionamento || loja.diasFuncionamento.length === 0)
      return true;

    return loja.diasFuncionamento.includes(String(dia));
  }

  const isoData = formatISO(data);

  return (
    <div className="public-container">

      <h1>Escolha o Horário</h1>
      {servico && <h2>{servico.nome}</h2>}

      {/* PROFISSIONAIS */}
      {loja.usaProfissionais && (
        <>
          <h3>Profissional</h3>
          <select
            value={profissionalSelecionado || ""}
            onChange={(e) => setProfissionalSelecionado(e.target.value)}
            className="select-prof"
          >
            <option value="">Selecione</option>
            {profissionais.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </>
      )}

      {/* CALENDÁRIO SIMPLES */}
      <div className="calendar-nav">
        <button onClick={() => setData(addDays(data, -1))}>◀</button>
        <span>{data.toLocaleDateString()}</span>
        <button onClick={() => setData(addDays(data, 1))}>▶</button>
      </div>

      {!diaPermitido(data) && (
        <div className="alert">
          Loja fechada neste dia. Escolha outro.
        </div>
      )}

      {/* HORÁRIOS */}
      <h3>Horários Disponíveis</h3>

      <div className="horarios-grid">
        {horarios.length === 0 && (
          <p className="nenhum">Nenhum horário disponível.</p>
        )}

        {horarios.map((h) => {
          const hora = h.split("T")[1].substring(0, 5); // ex: 14:00

          return (
            <button
              key={h}
              className="horario-btn"
              onClick={() =>
                navigate(`/public/confirmar/${lojaId}/${servicoId}/${h}`)
              }
            >
              {hora}
            </button>
          );
        })}
      </div>
    </div>
  );
}
