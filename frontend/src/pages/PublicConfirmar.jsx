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
  const [enviando, setEnviando] = useState(false);
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

  async function confirmarAgendamento(e) {
    e.preventDefault();
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
      profissionalId: null,
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
        // Formatar data e hora para exibição
        const dataHoraObj = new Date(dataHora);
        const dataFormatada = dataHoraObj.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        const horaFormatada = dataHora.split("T")[1].substring(0, 5);

        // Navegar para página de sucesso com dados
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

  // Formatar data e hora
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
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '30px',
          borderRadius: '16px',
          color: 'white',
          marginBottom: '24px',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
        }}>
          <h2 style={{ 
            color: 'white', 
            fontSize: '24px', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            ✨ Resumo do Agendamento
          </h2>

          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '20px',
            backdropFilter: 'blur(10px)'
          }}>
            {servico && (
              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '6px' }}>Serviço</div>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>{servico.nome}</div>
                {servico.preco && (
                  <div style={{ fontSize: '16px', marginTop: '6px' }}>
                    💰 R$ {servico.preco.toFixed(2)}
                  </div>
                )}
              </div>
            )}

            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '6px' }}>📅 Data</div>
              <div style={{ fontSize: '16px', fontWeight: '600', textTransform: 'capitalize' }}>
                {dataFormatada}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '6px' }}>🕐 Horário</div>
              <div style={{ fontSize: '20px', fontWeight: '700' }}>{horaFormatada}</div>
            </div>
          </div>
        </div>

        {/* CARD DO FORMULÁRIO */}
        <div className="public-card">
          <h2>📝 Seus Dados</h2>
          <p style={{ color: '#777', marginBottom: '30px' }}>
            Preencha suas informações para confirmar o agendamento
          </p>

          <form onSubmit={confirmarAgendamento} className="form-public">

            {/* Nome */}
            {loja.obrigarNome && (
              <div className="form-group-public">
                <label>👤 Nome completo *</label>
                <input
                  type="text"
                  placeholder="Digite seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required={loja.obrigarNome}
                />
              </div>
            )}

            {/* Telefone */}
            {loja.obrigarTelefone && (
              <div className="form-group-public">
                <label>📱 Telefone *</label>
                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  required={loja.obrigarTelefone}
                />
              </div>
            )}

            {/* Email */}
            {loja.obrigarEmail && (
              <div className="form-group-public">
                <label>📧 E-mail *</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required={loja.obrigarEmail}
                />
              </div>
            )}

            {/* Observações */}
            {loja.mostrarObservacoes && (
              <div className="form-group-public">
                <label>💬 Observações (opcional)</label>
                <textarea
                  placeholder="Alguma informação adicional que gostaria de compartilhar?"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={4}
                />
              </div>
            )}

            {/* CAMPOS PERSONALIZADOS */}
            {camposPersonalizados.length > 0 && (
              <>
                <h3 style={{ 
                  marginTop: '30px', 
                  marginBottom: '20px',
                  fontSize: '18px',
                  color: '#333'
                }}>
                  ℹ️ Informações Adicionais
                </h3>

                {camposPersonalizados.map((campo) => (
                  <div key={campo.id} className="form-group-public">
                    <label>
                      {campo.pergunta}
                      {campo.obrigatorio && <span style={{ color: '#f44336', marginLeft: '4px' }}>*</span>}
                    </label>

                    {/* Sim/Não */}
                    {campo.tipoResposta === "sim_nao" && (
                      <select
                        value={respostas[campo.id] || ""}
                        onChange={(e) => handleResposta(campo.id, e.target.value)}
                        required={campo.obrigatorio}
                      >
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="Não">Não</option>
                      </select>
                    )}

                    {/* Número */}
                    {campo.tipoResposta === "numero" && (
                      <input
                        type="number"
                        value={respostas[campo.id] || ""}
                        onChange={(e) => handleResposta(campo.id, e.target.value)}
                        required={campo.obrigatorio}
                      />
                    )}

                    {/* Texto */}
                    {(campo.tipoResposta === "texto" || !campo.tipoResposta) && (
                      <input
                        type="text"
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

            {/* MENSAGEM DE ERRO */}
            {erro && (
              <div className="erro-mensagem" style={{ marginTop: '20px' }}>
                ⚠️ {erro}
              </div>
            )}

            {/* BOTÕES */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginTop: '30px',
              flexWrap: 'wrap'
            }}>
              <button
                type="button"
                className="btn-voltar"
                onClick={() => navigate(-1)}
                disabled={enviando}
                style={{ flex: '1', minWidth: '200px' }}
              >
                ← Voltar
              </button>

              <button
                type="submit"
                className="btn-public"
                disabled={enviando}
                style={{ flex: '2', minWidth: '200px' }}
              >
                {enviando ? '⏳ Confirmando...' : '✅ Confirmar Agendamento'}
              </button>
            </div>
          </form>
        </div>

        {/* INFORMAÇÕES */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '16px',
          borderRadius: '12px',
          textAlign: 'center',
          fontSize: '13px',
          color: '#666'
        }}>
          <p style={{ margin: 0 }}>
            🔒 Seus dados estão seguros. Após confirmar, você receberá um resumo do agendamento.
          </p>
        </div>
      </div>
    </div>
  );
}
