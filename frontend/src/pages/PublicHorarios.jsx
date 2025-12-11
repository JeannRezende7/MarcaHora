import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import publicApi from "../services/publicApi";

export default function PublicHorarios() {
  const { lojaId, servicoId } = useParams();
  const navigate = useNavigate();

  const [loja, setLoja] = useState(null);
  const [servico, setServico] = useState(null);

  const [data, setData] = useState(() => {
    const hoje = new Date();
    return hoje.toISOString().substring(0, 10);
  });

  const [horarios, setHorarios] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarLoja();
  }, []);

  async function carregarLoja() {
    try {
      const resp = await publicApi.get(`/public/loja/${lojaId}`);
      setLoja(resp.data.loja);

      if (Number(servicoId) !== 0) {
        const serv = resp.data.servicos.find((s) => s.id == servicoId);
        setServico(serv);
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar dados da loja.");
    }

    carregarHorarios(data);
  }

  async function carregarHorarios(dataEscolhida) {
    try {
      const url = `/public/agendamentos/horarios?lojaId=${lojaId}&servicoId=${servicoId}&data=${dataEscolhida}`;
      const resp = await publicApi.get(url);
      setHorarios(resp.data.horarios);
    } catch (e) {
      console.error(e);
      alert("Erro ao buscar horários disponíveis.");
    }

    setCarregando(false);
  }

  function escolherHorario(h) {
    const dataHoraFinal = `${data}T${h}:00`;
    navigate(`/public/confirmar/${lojaId}/${servicoId}/${dataHoraFinal}`);
  }

  if (carregando || !loja) return <div>Carregando...</div>;

  return (
    <div className="public-container">
      <h1>{loja.nome}</h1>

      {servico && (
        <p>
          <strong>Serviço: </strong> {servico.nome}
        </p>
      )}

      <div className="box-calendario">
        <label>Selecione a data:</label>
        <input
          type="date"
          value={data}
          onChange={(e) => {
            setData(e.target.value);
            carregarHorarios(e.target.value);
          }}
        />
      </div>

      <h2>Horários disponíveis</h2>

      {horarios.length === 0 && <p>Nenhum horário disponível.</p>}

      <div className="lista-horarios">
        {horarios.map((h) => (
          <button key={h} className="horario-btn" onClick={() => escolherHorario(h)}>
            {h}
          </button>
        ))}
      </div>
    </div>
  );
}
