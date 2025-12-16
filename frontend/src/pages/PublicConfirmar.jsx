import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../services/api";
import '../styles/public-reset.css';  
import '../styles/public.css';  

export default function PublicConfirmar() {
  const { lojaId, servicoId, dataHora } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loja, setLoja] = useState(null);
  const [servico, setServico] = useState(null);
  const [profissional, setProfissional] = useState(null);
  const [camposPersonalizados, setCamposPersonalizados] = useState([]);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [respostas, setRespostas] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const respLoja = await api.get(`/public/loja/${lojaId}`);
        const lojaData = respLoja.data.loja;
        setLoja(lojaData);

        if (lojaData.usaServicos && servicoId !== "0") {
          const respServico = await api.get(`/api/servicos/${servicoId}`);
          setServico(respServico.data);
        }

        const profissionalId = searchParams.get('profissionalId');
        if (profissionalId) {
          try {
            const respProf = await api.get(`/api/profissionais/${profissionalId}`);
            setProfissional(respProf.data);
          } catch (e) {
            console.log("Erro ao carregar profissional:", e);
          }
        }

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

  async function confirmarAgendamento(e) {
    e.preventDefault();
    if (!loja) return;

    setErro("");

    if (loja.mostrarNome && loja.obrigarNome && nome.trim() === "") {
      return setErro("O nome é obrigatório.");
    }
    if (loja.mostrarTelefone && loja.obrigarTelefone && telefone.trim() === "") {
      return setErro("O telefone é obrigatório.");
    }
    if (loja.mostrarEmail && loja.obrigarEmail && email.trim() === "") {
      return setErro("O e-mail é obrigatório.");
    }

    for (let campo of camposPersonalizados) {
      if (campo.obrigatorio && (!respostas[campo.id] || respostas[campo.id].trim() === "")) {
        return setErro(`O campo "${campo.pergunta}" é obrigatório.`);
      }
    }

    const profissionalId = searchParams.get('profissionalId');
    const payload = {
      lojaId: Number(lojaId),
      servicoId: loja.usaServicos ? Number(servicoId) : null,
      profissionalId: profissionalId ? Number(profissionalId) : null,
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

    setEnviando(true);

    try {
      const resp = await api.post("/public/agendamentos/criar", payload);
      if (resp.data.agendamentoId) {
        const dataHoraObj = new Date(dataHora);
        const dataFormatada = dataHoraObj.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        const horaFormatada = dataHora.split("T")[1].substring(0, 5);

        navigate("/public/sucesso", {
          state: {
            lojaId: lojaId,
            servicoNome: servico?.nome || servico?.descricao || null,
            data: dataFormatada,
            horario: horaFormatada,
            nome: nome
          }
        });
      }
    } catch (e) {
      console.error(e);
      setErro(e.response?.data || "Erro ao criar agendamento.");
      setEnviando(false);
    }
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

  const dataHoraObj = new Date(dataHora);
  const dataFormatada = dataHoraObj.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const horaFormatada = dataHora.split("T")[1].substring(0, 5);

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

        {/* RESUMO DO AGENDAMENTO */}
        <div className="resumo-agendamento">
          <h3>✨ Resumo do Agendamento</h3>

          {servico && (
            <div className="resumo-item">
              <span className="resumo-label">Serviço</span>
              <span className="resumo-value">
                {servico.nome}
                {servico.preco && ` • R$ ${servico.preco.toFixed(2)}`}
              </span>
            </div>
          )}

          {profissional && (
            <div className="resumo-item">
              <span className="resumo-label">Profissional</span>
              <span className="resumo-value">👤 {profissional.nome}</span>
            </div>
          )}

          <div className="resumo-item">
            <span className="resumo-label">📅 Data</span>
            <span className="resumo-value" style={{ textTransform: 'capitalize' }}>
              {dataFormatada}
            </span>
          </div>

          <div className="resumo-item">
            <span className="resumo-label">🕐 Horário</span>
            <span className="resumo-value">{horaFormatada}</span>
          </div>
        </div>

        {/* FORMULÁRIO */}
        <div className="public-card">
          <h2>📝 Seus Dados</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Preencha suas informações para confirmar o agendamento
          </p>

          <form onSubmit={confirmarAgendamento}>

            {loja.mostrarNome && (
              <div className="form-group-public">
                <label className="form-label-public">
                  👤 Nome completo {loja.obrigarNome && <span className="required">*</span>}
                </label>
                <input
                  type="text"
                  className="form-input-public"
                  placeholder="Digite seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required={loja.obrigarNome}
                />
              </div>
            )}

            {loja.mostrarTelefone && (
              <div className="form-group-public">
                <label className="form-label-public">
                  📱 Telefone {loja.obrigarTelefone && <span className="required">*</span>}
                </label>
                <input
                  type="tel"
                  className="form-input-public"
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  required={loja.obrigarTelefone}
                />
              </div>
            )}

            {loja.mostrarEmail && (
              <div className="form-group-public">
                <label className="form-label-public">
                  📧 E-mail {loja.obrigarEmail && <span className="required">*</span>}
                </label>
                <input
                  type="email"
                  className="form-input-public"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required={loja.obrigarEmail}
                />
              </div>
            )}

            {loja.mostrarObservacoes && (
              <div className="form-group-public">
                <label className="form-label-public">💬 Observações (opcional)</label>
                <textarea
                  className="form-input-public"
                  placeholder="Alguma informação adicional que gostaria de compartilhar?"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={4}
                />
              </div>
            )}

            {camposPersonalizados.length > 0 && (
              <>
                <h3 style={{ marginTop: '24px', marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                  ℹ️ Informações Adicionais
                </h3>

                {camposPersonalizados.map((campo) => (
                  <div key={campo.id} className="form-group-public">
                    <label className="form-label-public">
                      {campo.pergunta}
                      {campo.obrigatorio && <span className="required">*</span>}
                    </label>

                    {campo.tipoResposta === "sim_nao" && (
                      <select
                        className="form-input-public"
                        value={respostas[campo.id] || ""}
                        onChange={(e) => handleResposta(campo.id, e.target.value)}
                        required={campo.obrigatorio}
                      >
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="Não">Não</option>
                      </select>
                    )}

                    {campo.tipoResposta === "numero" && (
                      <input
                        type="number"
                        className="form-input-public"
                        value={respostas[campo.id] || ""}
                        onChange={(e) => handleResposta(campo.id, e.target.value)}
                        required={campo.obrigatorio}
                      />
                    )}

                    {(campo.tipoResposta === "texto" || !campo.tipoResposta) && (
                      <input
                        type="text"
                        className="form-input-public"
                        placeholder="Digite sua resposta"
                        value={respostas[campo.id] || ""}
                        onChange={(e) => handleResposta(campo.id, e.target.value)}
                        required={campo.obrigatorio}
                      />
                    )}
                  </div>
                ))}
              </>
            )}

            {erro && (
              <div style={{ 
                padding: '12px',
                background: '#fef2f2',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '14px',
                marginTop: '16px'
              }}>
                ⚠️ {erro}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-secondary-public"
                onClick={() => navigate(-1)}
                disabled={enviando}
              >
                ← Voltar
              </button>

              <button
                type="submit"
                className="btn-public"
                disabled={enviando}
              >
                {enviando ? '⏳ Confirmando...' : '✅ Confirmar Agendamento'}
              </button>
            </div>
          </form>
        </div>

        <div style={{
          background: '#f9fafb',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '13px',
          color: '#6b7280',
          border: '1px solid #e5e7eb'
        }}>
          🔒 Seus dados estão seguros. Após confirmar, você receberá um resumo do agendamento.
        </div>
      </div>
    </div>
  );
}