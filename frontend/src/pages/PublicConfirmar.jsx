import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/public.css";

export default function PublicConfirmar() {
  const { lojaId, servicoId, dataHora } = useParams();
  const navigate = useNavigate();

  const [loja, setLoja] = useState(null);
  const [servico, setServico] = useState(null);
  const [camposPersonalizados, setCamposPersonalizados] = useState([]);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [respostas, setRespostas] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        // Carregar loja
        const respLoja = await api.get(`/public/loja/${lojaId}`);
        const lojaData = respLoja.data.loja;
        setLoja(lojaData);

        // Carregar serviço se necessário
        if (lojaData.usaServicos && servicoId !== "0") {
          const respServico = await api.get(`/api/servicos/${servicoId}`);
          setServico(respServico.data);
        }

        // Carregar campos personalizados
        const respCampos = await api.get(`/api/configuracoes/${lojaId}/campos-personalizados`);
        setCamposPersonalizados(respCampos.data || []);

        setCarregando(false);
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
        setErro("Erro ao carregar dados do agendamento.");
        setCarregando(false);
      }
    }

    carregar();
  }, [lojaId, servicoId]);

  function handleResposta(campoId, valor) {
    setRespostas({
      ...respostas,
      [campoId]: valor
    });
  }

  async function confirmarAgendamento() {
    if (!loja) return;

    setErro("");

    // Validações conforme configuração da loja
    if (loja.obrigarNome && nome.trim() === "") {
      return setErro("O nome é obrigatório.");
    }
    if (loja.obrigarTelefone && telefone.trim() === "") {
      return setErro("O telefone é obrigatório.");
    }
    if (loja.obrigarEmail && email.trim() === "") {
      return setErro("O e-mail é obrigatório.");
    }

    // Validação dos campos personalizados obrigatórios
    for (let campo of camposPersonalizados) {
      if (campo.obrigatorio && (!respostas[campo.id] || respostas[campo.id].trim() === "")) {
        return setErro(`O campo "${campo.pergunta}" é obrigatório.`);
      }
    }

    // Monta o corpo do POST
    const payload = {
      lojaId: Number(lojaId),
      servicoId: loja.usaServicos ? Number(servicoId) : null,
      profissionalId: null, // implementação futura
      dataHora,
      nome,
      telefone,
      email,
      observacoes,
      camposPersonalizados: camposPersonalizados.map((c) => ({
        campoId: c.id,
        resposta: respostas[c.id] || ""
      }))
    };

    try {
      const resp = await api.post("/public/agendamentos/criar", payload);
      if (resp.data.agendamentoId) {
        navigate("/public/sucesso");
      }
    } catch (e) {
      console.error(e);
      setErro(e.response?.data || "Erro ao criar agendamento.");
    }
  }

  if (carregando) return <div className="carregando">Carregando...</div>;
  if (!loja) return <div>Loja não encontrada</div>;

  const horaFormatada = dataHora.split("T")[1].substring(0, 5);
  const dataFormatada = new Date(dataHora).toLocaleDateString();

  return (
    <div className="public-container">

      <h1>Confirmar Agendamento</h1>

      {servico && <h2>Serviço: {servico.nome}</h2>}

      <p>
        <strong>Data:</strong> {dataFormatada}<br />
        <strong>Horário:</strong> {horaFormatada}
      </p>

      <div className="formulario">

        {loja.obrigarNome && (
          <input
            type="text"
            placeholder="Seu nome *"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        )}

        {loja.obrigarTelefone && (
          <input
            type="tel"
            placeholder="Telefone *"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
        )}

        {loja.obrigarEmail && (
          <input
            type="email"
            placeholder="E-mail *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        )}

        {loja.mostrarObservacoes && (
          <textarea
            placeholder="Observações (opcional)"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          />
        )}

        {/* CAMPOS PERSONALIZADOS */}
        {camposPersonalizados.length > 0 && (
          <>
            <h3>Informações adicionais</h3>

            {camposPersonalizados.map((campo) => (
              <div key={campo.id} className="campo-extra">

                <label>
                  {campo.pergunta}
                  {campo.obrigatorio && <span className="obrigatorio">*</span>}
                </label>

                {/* Tipo de campo */}
                {campo.tipoResposta === "sim_nao" && (
                  <select
                    value={respostas[campo.id] || ""}
                    onChange={(e) => handleResposta(campo.id, e.target.value)}
                  >
                    <option value="">Selecione</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                )}

                {campo.tipoResposta === "numero" && (
                  <input
                    type="number"
                    value={respostas[campo.id] || ""}
                    onChange={(e) => handleResposta(campo.id, e.target.value)}
                  />
                )}

                {campo.tipoResposta === "texto" && (
                  <input
                    type="text"
                    value={respostas[campo.id] || ""}
                    onChange={(e) => handleResposta(campo.id, e.target.value)}
                  />
                )}

                {/* Futuro: múltipla escolha */}
                {campo.tipoResposta === "opcao" && (
                  <input
                    type="text"
                    placeholder="Digite sua resposta"
                    value={respostas[campo.id] || ""}
                    onChange={(e) => handleResposta(campo.id, e.target.value)}
                  />
                )}
              </div>
            ))}
          </>
        )}

        {erro && <div className="erro">{erro}</div>}

        <button className="btn-confirmar" onClick={confirmarAgendamento}>
          Confirmar Agendamento
        </button>

      </div>

    </div>
  );
}
