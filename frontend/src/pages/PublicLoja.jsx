import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import publicApi from "../services/publicApi";

export default function PublicLoja() {
  const { id } = useParams(); // lojaId
  const navigate = useNavigate();

  const [carregando, setCarregando] = useState(true);
  const [loja, setLoja] = useState(null);
  const [servicos, setServicos] = useState([]);

  const [servicoId, setServicoId] = useState(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      const resp = await publicApi.get(`/public/loja/${id}`);

      if (resp.data.status === "offline") {
        alert("Loja temporariamente indisponível");
        return;
      }

      setLoja(resp.data.loja);
      setServicos(resp.data.servicos || []);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar loja");
    }

    setCarregando(false);
  }

  function continuar() {
    if (loja.usaServicos && !servicoId) {
      alert("Selecione um serviço");
      return;
    }

    const chosenServicoId = loja.usaServicos ? servicoId : 0;

    navigate(`/public/loja/${id}/servico/${chosenServicoId}`);
  }

  if (carregando) return <div>Carregando...</div>;

  return (
    <div className="public-container">
      <h1>{loja.nome}</h1>
      <p>{loja.telefone}</p>

      {loja.usaServicos && (
        <div className="servicos-box">
          <h2>Selecione um serviço</h2>

          {servicos.length === 0 && <p>Nenhum serviço cadastrado.</p>}

          {servicos.map((s) => (
            <div
              key={s.id}
              className={`servico-item ${servicoId == s.id ? "selecionado" : ""}`}
              onClick={() => setServicoId(s.id)}
            >
              <strong>{s.nome}</strong>
              {s.preco && <span> - R$ {Number(s.preco).toFixed(2)}</span>}
            </div>
          ))}
        </div>
      )}

      <button className="btn-principal" onClick={continuar}>
        Escolher horário
      </button>
    </div>
  );
}
