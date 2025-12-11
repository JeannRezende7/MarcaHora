import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import publicApi from "../services/publicApi";

export default function PublicConfirmar() {
  const { lojaId, servicoId, dataHora } = useParams();
  const navigate = useNavigate();

  const [loja, setLoja] = useState(null);
  const [servico, setServico] = useState(null);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [obs, setObs] = useState("");

  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const resp = await publicApi.get(`/public/loja/${lojaId}`);
      setLoja(resp.data.loja);

      if (Number(servicoId) !== 0) {
        const serv = resp.data.servicos.find((s) => s.id == servicoId);
        setServico(serv);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar informações.");
    }
    setCarregando(false);
  }

  async function confirmar() {
    if (!nome.trim()) return alert("Informe seu nome.");

    try {
      const payload = {
        lojaId: Number(lojaId),
        servicoId: Number(servicoId),
        dataHora,
        nome,
        telefone,
        email,
        observacoes: obs,
      };

      await publicApi.post("/public/agendamentos/criar", payload);

      navigate("/public/sucesso");
    } catch (e) {
      console.error(e);
      alert("Erro ao realizar agendamento.");
    }
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

      <p>
        <strong>Horário escolhido:</strong>{" "}
        {dataHora.substring(8, 10)}/{dataHora.substring(5, 7)} —{" "}
        {dataHora.substring(11, 16)}
      </p>

      <div className="public-form">
        <label>Nome *</label>
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />

        <label>Telefone</label>
        <input
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          placeholder="(00) 00000-0000"
        />

        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />

        <label>Observações</label>
        <textarea value={obs} onChange={(e) => setObs(e.target.value)} />

        <button className="btn-confirmar" onClick={confirmar}>
          Confirmar Agendamento
        </button>
      </div>
    </div>
  );
}
