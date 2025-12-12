// src/pages/Configuracoes.jsx
import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"
import "../styles/configuracoes.css";

export default function Configuracoes() {
  const { usuario, atualizarLojaNoContexto } = useAuth()
  const lojaId = usuario?.lojaId

  // Estados
  const [infoLoja, setInfoLoja] = useState({
    nome: "",
    telefone: "",
    email: "",
    logoUrl: "",
  })

  const [horarios, setHorarios] = useState({
    abertura: "09:00",
    fechamento: "18:00",
    intervalo: 30,
    buffer: 0,
    dias: [],
  })

  const [camposCliente, setCamposCliente] = useState({
    obrigarNome: true,
    obrigarEmail: false,
    obrigarTelefone: true,
  })

  const [camposVisiveis, setCamposVisiveis] = useState({
    mostrarNome: true,
    mostrarTelefone: true,
    mostrarEmail: true,
    mostrarObservacoes: true,
  })

  const [configModos, setConfigModos] = useState({
    usaServicos: true,
    usaProfissionais: false,
  })

  const [camposPersonalizados, setCamposPersonalizados] = useState([])
  const [novoCampo, setNovoCampo] = useState({
    pergunta: "",
    tipoResposta: "texto",
    obrigatorio: false,
  })

  const [mensagem, setMensagem] = useState("")
  const [erro, setErro] = useState("")

  const diasSemana = [
    { valor: "1", rotulo: "Segunda" },
    { valor: "2", rotulo: "Terça" },
    { valor: "3", rotulo: "Quarta" },
    { valor: "4", rotulo: "Quinta" },
    { valor: "5", rotulo: "Sexta" },
    { valor: "6", rotulo: "Sábado" },
    { valor: "7", rotulo: "Domingo" },
  ]

  useEffect(() => {
    if (!lojaId) return
    carregar()
  }, [lojaId])

  async function carregar() {
    try {
      const resp = await api.get(`/api/configuracoes/${lojaId}`)
      const data = resp.data

      if (data) {
        setInfoLoja({
          nome: data.nome || "",
          telefone: data.telefone || "",
          email: data.email || "",
          logoUrl: data.logoUrl || "",
        })

        setHorarios({
          abertura: data.horarioAbertura || "09:00",
          fechamento: data.horarioFechamento || "18:00",
          intervalo: data.intervaloAtendimento || 30,
          buffer: data.tempoBufferMinutos || 0,
          dias: data.diasFuncionamento || [],
        })

        setCamposCliente({
          obrigarNome: data.obrigarNome ?? true,
          obrigarEmail: data.obrigarEmail ?? false,
          obrigarTelefone: data.obrigarTelefone ?? true,
        })

        setCamposVisiveis({
          mostrarNome: data.mostrarNome ?? true,
          mostrarTelefone: data.mostrarTelefone ?? true,
          mostrarEmail: data.mostrarEmail ?? true,
          mostrarObservacoes: data.mostrarObservacoes ?? true,
        })

        setConfigModos({
          usaServicos: data.usaServicos ?? true,
          usaProfissionais: data.usaProfissionais ?? false,
        })
      }

      // Campos personalizados
      try {
        const respCampos = await api.get(`/api/configuracoes/${lojaId}/campos-personalizados`)
        setCamposPersonalizados(respCampos.data || [])
      } catch (err) {
        console.log("Erro ao carregar campos personalizados:", err)
      }
    } catch (err) {
      console.error("Erro ao carregar configurações:", err)
      setErro("Erro ao carregar configurações")
    }
  }

  async function salvarInfoLoja(e) {
    e.preventDefault()
    console.log("🔍 salvarInfoLoja chamado")
    setMensagem("")
    setErro("")

    try {
      const payload = {
        nome: infoLoja.nome,
        telefone: infoLoja.telefone,
        email: infoLoja.email,
        logoUrl: infoLoja.logoUrl,
      }

      console.log("📤 Enviando payload:", payload)
      const response = await api.put(`/api/configuracoes/${lojaId}/info`, payload)
      console.log("✅ Resposta recebida:", response.data)
      
      if (atualizarLojaNoContexto) {
        atualizarLojaNoContexto({ nome: infoLoja.nome })
      }

      setMensagem("✅ Informações da loja salvas com sucesso!")
      setTimeout(() => setMensagem(""), 3000)
    } catch (err) {
      console.error("❌ Erro completo:", err)
      console.error("❌ Resposta do erro:", err.response)
      setErro("❌ Erro ao salvar informações da loja")
    }
  }

  async function salvarHorarios(e) {
    e.preventDefault()
    console.log("🔍 salvarHorarios chamado")
    setMensagem("")
    setErro("")

    try {
      const payload = {
        abertura: horarios.abertura,
        fechamento: horarios.fechamento,
        intervalo: parseInt(horarios.intervalo) || 30,
        buffer: parseInt(horarios.buffer) || 0,
        dias: horarios.dias,
      }

      console.log("📤 Enviando payload horários:", payload)
      const response = await api.put(`/api/configuracoes/${lojaId}/horarios`, payload)
      console.log("✅ Resposta recebida:", response.data)
      setMensagem("✅ Horários salvos com sucesso!")
      setTimeout(() => setMensagem(""), 3000)
    } catch (err) {
      console.error("❌ Erro em salvarHorarios:", err)
      console.error("❌ Resposta do erro:", err.response)
      setErro("❌ Erro ao salvar horários")
    }
  }

  async function salvarCamposCliente(e) {
    e.preventDefault()
    console.log("🔍 salvarCamposCliente chamado")
    setMensagem("")
    setErro("")

    try {
      console.log("📤 Enviando camposCliente:", camposCliente)
      const response = await api.put(`/api/configuracoes/${lojaId}/campos-obrigatorios`, camposCliente)
      console.log("✅ Resposta recebida:", response.data)
      setMensagem("✅ Campos obrigatórios salvos com sucesso!")
      setTimeout(() => setMensagem(""), 3000)
    } catch (err) {
      console.error("❌ Erro em salvarCamposCliente:", err)
      console.error("❌ Resposta do erro:", err.response)
      setErro("❌ Erro ao salvar campos obrigatórios")
    }
  }

  async function salvarCamposVisiveis(e) {
    e.preventDefault()
    console.log("🔍 salvarCamposVisiveis chamado")
    setMensagem("")
    setErro("")

    try {
      console.log("📤 Enviando camposVisiveis:", camposVisiveis)
      const response = await api.put(`/api/configuracoes/${lojaId}/campos-visiveis`, camposVisiveis)
      console.log("✅ Resposta recebida:", response.data)
      setMensagem("✅ Campos visíveis salvos com sucesso!")
      setTimeout(() => setMensagem(""), 3000)
    } catch (err) {
      console.error("❌ Erro em salvarCamposVisiveis:", err)
      console.error("❌ Resposta do erro:", err.response)
      setErro("❌ Erro ao salvar campos visíveis")
    }
  }

  async function salvarModos(e) {
    e.preventDefault()
    console.log("🔍 salvarModos chamado")
    setMensagem("")
    setErro("")

    try {
      console.log("📤 Enviando configModos:", configModos)
      const response = await api.put(`/api/configuracoes/${lojaId}/modos`, configModos)
      console.log("✅ Resposta recebida:", response.data)
      setMensagem("✅ Modos do negócio salvos com sucesso!")
      setTimeout(() => setMensagem(""), 3000)
    } catch (err) {
      console.error("❌ Erro em salvarModos:", err)
      console.error("❌ Resposta do erro:", err.response)
      setErro("❌ Erro ao salvar modos do negócio")
    }
  }

  async function adicionarCampo(e) {
    e.preventDefault()
    if (!novoCampo.pergunta.trim()) {
      setErro("❌ Digite uma pergunta para o campo")
      return
    }

    setErro("")

    try {
      const resp = await api.post(`/api/configuracoes/${lojaId}/campos-personalizados`, novoCampo)
      setCamposPersonalizados([...camposPersonalizados, resp.data])
      setNovoCampo({ pergunta: "", tipoResposta: "texto", obrigatorio: false })
      setMensagem("✅ Campo personalizado adicionado!")
      setTimeout(() => setMensagem(""), 3000)
    } catch (err) {
      console.error(err)
      setErro("❌ Erro ao adicionar campo personalizado")
    }
  }

  async function removerCampo(id) {
    if (!confirm("Tem certeza que deseja remover este campo?")) return

    try {
      await api.delete(`/api/configuracoes/${lojaId}/campos-personalizados/${id}`)
      setCamposPersonalizados(camposPersonalizados.filter((c) => c.id !== id))
      setMensagem("✅ Campo removido com sucesso!")
      setTimeout(() => setMensagem(""), 3000)
    } catch (err) {
      console.error(err)
      setErro("❌ Erro ao remover campo")
    }
  }

  return (
    <div className="configuracoes-page">
      <h1>⚙️ Configurações</h1>

      {mensagem && <div className="mensagem-sucesso">{mensagem}</div>}
      {erro && <div className="mensagem-erro">{erro}</div>}

      {/* INFORMAÇÕES DA LOJA */}
      <div className="secao">
        <h2>🏪 Informações da Loja</h2>

        <form onSubmit={salvarInfoLoja}>
          <div className="form-group">
            <label>Nome da Loja *</label>
            <input
              type="text"
              value={infoLoja.nome}
              onChange={(e) => setInfoLoja({ ...infoLoja, nome: e.target.value })}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Telefone</label>
              <input
                type="tel"
                value={infoLoja.telefone}
                onChange={(e) => setInfoLoja({ ...infoLoja, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="form-group">
              <label>E-mail</label>
              <input
                type="email"
                value={infoLoja.email}
                onChange={(e) => setInfoLoja({ ...infoLoja, email: e.target.value })}
                placeholder="contato@loja.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label>URL do Logo</label>
            <input
              type="url"
              value={infoLoja.logoUrl}
              onChange={(e) => setInfoLoja({ ...infoLoja, logoUrl: e.target.value })}
              placeholder="https://exemplo.com/logo.png"
            />
            <small>Cole o link de uma imagem do seu logo para exibir na página pública</small>
          </div>

          <button type="submit" className="btn-salvar">
            💾 Salvar Informações
          </button>
        </form>
      </div>

      {/* HORÁRIOS */}
      <div className="secao">
        <h2>🕐 Horários de Funcionamento</h2>

        <form onSubmit={salvarHorarios}>
          <div className="grid-2">
            <div className="form-group">
              <label>Horário de Abertura</label>
              <input
                type="time"
                value={horarios.abertura}
                onChange={(e) => setHorarios({ ...horarios, abertura: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Horário de Fechamento</label>
              <input
                type="time"
                value={horarios.fechamento}
                onChange={(e) => setHorarios({ ...horarios, fechamento: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Intervalo entre Agendamentos (minutos)</label>
              <input
                type="number"
                min="5"
                step="5"
                value={horarios.intervalo}
                onChange={(e) => setHorarios({ ...horarios, intervalo: e.target.value })}
              />
              <small>Ex: 30 minutos = horários a cada meia hora (10:00, 10:30, 11:00...)</small>
            </div>

            <div className="form-group">
              <label>Buffer entre Agendamentos (minutos)</label>
              <input
                type="number"
                min="0"
                step="5"
                value={horarios.buffer}
                onChange={(e) => setHorarios({ ...horarios, buffer: e.target.value })}
              />
              <small>Tempo de folga entre atendimentos</small>
            </div>
          </div>

          <div className="form-group">
            <label>Dias de Funcionamento</label>
            <div className="dias-semana-grid">
              {diasSemana.map((dia) => (
                <div key={dia.valor} className="dia-semana-item">
                  <input
                    type="checkbox"
                    id={`dia-${dia.valor}`}
                    checked={horarios.dias.includes(dia.valor)}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setHorarios((h) => {
                        const atual = new Set(h.dias)
                        if (checked) atual.add(dia.valor)
                        else atual.delete(dia.valor)
                        return { ...h, dias: [...atual] }
                      })
                    }}
                  />
                  <label htmlFor={`dia-${dia.valor}`}>{dia.rotulo}</label>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-salvar">
            💾 Salvar Horários
          </button>
        </form>
      </div>

      {/* CAMPOS OBRIGATÓRIOS */}
      <div className="secao">
        <h2>📝 Campos Obrigatórios</h2>

        <form onSubmit={salvarCamposCliente}>
          <div className="checkbox-group">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="obrigar-nome"
                checked={camposCliente.obrigarNome}
                onChange={(e) =>
                  setCamposCliente({ ...camposCliente, obrigarNome: e.target.checked })
                }
              />
              <label htmlFor="obrigar-nome">Nome obrigatório</label>
            </div>

            <div className="checkbox-item">
              <input
                type="checkbox"
                id="obrigar-email"
                checked={camposCliente.obrigarEmail}
                onChange={(e) =>
                  setCamposCliente({ ...camposCliente, obrigarEmail: e.target.checked })
                }
              />
              <label htmlFor="obrigar-email">Email obrigatório</label>
            </div>

            <div className="checkbox-item">
              <input
                type="checkbox"
                id="obrigar-telefone"
                checked={camposCliente.obrigarTelefone}
                onChange={(e) =>
                  setCamposCliente({ ...camposCliente, obrigarTelefone: e.target.checked })
                }
              />
              <label htmlFor="obrigar-telefone">Telefone obrigatório</label>
            </div>
          </div>

          <button type="submit" className="btn-salvar">
            💾 Salvar
          </button>
        </form>
      </div>

      {/* CAMPOS VISÍVEIS */}
      <div className="secao">
        <h2>📋 Campos Visíveis</h2>
        <p style={{ color: '#777', marginBottom: '16px', fontSize: '14px' }}>
          Controle quais campos aparecem no formulário de agendamento público
        </p>

        <form onSubmit={salvarCamposVisiveis}>
          <div className="checkbox-group">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="mostrar-nome"
                checked={camposVisiveis.mostrarNome}
                onChange={(e) =>
                  setCamposVisiveis({ ...camposVisiveis, mostrarNome: e.target.checked })
                }
              />
              <label htmlFor="mostrar-nome">Mostrar campo Nome</label>
            </div>

            <div className="checkbox-item">
              <input
                type="checkbox"
                id="mostrar-telefone"
                checked={camposVisiveis.mostrarTelefone}
                onChange={(e) =>
                  setCamposVisiveis({ ...camposVisiveis, mostrarTelefone: e.target.checked })
                }
              />
              <label htmlFor="mostrar-telefone">Mostrar campo Telefone</label>
            </div>

            <div className="checkbox-item">
              <input
                type="checkbox"
                id="mostrar-email"
                checked={camposVisiveis.mostrarEmail}
                onChange={(e) =>
                  setCamposVisiveis({ ...camposVisiveis, mostrarEmail: e.target.checked })
                }
              />
              <label htmlFor="mostrar-email">Mostrar campo Email</label>
            </div>

            <div className="checkbox-item">
              <input
                type="checkbox"
                id="mostrar-observacoes"
                checked={camposVisiveis.mostrarObservacoes}
                onChange={(e) =>
                  setCamposVisiveis({ ...camposVisiveis, mostrarObservacoes: e.target.checked })
                }
              />
              <label htmlFor="mostrar-observacoes">Mostrar campo Observações</label>
            </div>
          </div>

          <button type="submit" className="btn-salvar">
            💾 Salvar
          </button>
        </form>
      </div>

      {/* MODOS DO NEGÓCIO */}
      <div className="secao">
        <h2>🎯 Modos do Negócio</h2>

        <form onSubmit={salvarModos}>
          <div className="checkbox-group">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="usa-servicos"
                checked={configModos.usaServicos}
                onChange={(e) =>
                  setConfigModos({ ...configModos, usaServicos: e.target.checked })
                }
              />
              <label htmlFor="usa-servicos">Usar sistema de serviços</label>
            </div>

            <div className="checkbox-item">
              <input
                type="checkbox"
                id="usa-profissionais"
                checked={configModos.usaProfissionais}
                onChange={(e) =>
                  setConfigModos({ ...configModos, usaProfissionais: e.target.checked })
                }
              />
              <label htmlFor="usa-profissionais">Usar profissionais</label>
            </div>
          </div>

          <button type="submit" className="btn-salvar">
            💾 Salvar
          </button>
        </form>
      </div>

      {/* CAMPOS PERSONALIZADOS */}
      <div className="secao">
        <h2>✏️ Campos Personalizados</h2>
        <p style={{ color: '#777', marginBottom: '24px' }}>
          Adicione perguntas extras que seus clientes devem responder ao agendar
        </p>

        <div className="novo-campo-form">
          <h3>➕ Adicionar Novo Campo</h3>
          <form onSubmit={adicionarCampo}>
            <div className="form-group">
              <label>Pergunta *</label>
              <input
                type="text"
                value={novoCampo.pergunta}
                onChange={(e) => setNovoCampo({ ...novoCampo, pergunta: e.target.value })}
                placeholder="Ex: Você tem alergia a algum medicamento?"
                required
              />
            </div>

            <div className="form-group">
              <label>Tipo de Resposta</label>
              <select
                value={novoCampo.tipoResposta}
                onChange={(e) => setNovoCampo({ ...novoCampo, tipoResposta: e.target.value })}
              >
                <option value="texto">Texto Livre</option>
                <option value="numero">Número</option>
                <option value="sim_nao">Sim/Não</option>
              </select>
            </div>

            <div className="checkbox-item">
              <input
                type="checkbox"
                id="campo-obrigatorio"
                checked={novoCampo.obrigatorio}
                onChange={(e) => setNovoCampo({ ...novoCampo, obrigatorio: e.target.checked })}
              />
              <label htmlFor="campo-obrigatorio">Campo obrigatório</label>
            </div>

            <button type="submit" className="btn-adicionar">
              ➕ Adicionar Campo
            </button>
          </form>
        </div>

        {camposPersonalizados.length === 0 ? (
          <div className="estado-vazio">
            <div className="estado-vazio-icon">📋</div>
            <p>Nenhum campo personalizado adicionado</p>
          </div>
        ) : (
          <div className="lista-campos">
            {camposPersonalizados.map((campo) => (
              <div key={campo.id} className="campo-item">
                <div className="campo-item-info">
                  <div className="campo-item-pergunta">{campo.pergunta}</div>
                  <div className="campo-item-detalhes">
                    <span>Tipo: {campo.tipoResposta === "sim_nao" ? "Sim/Não" : campo.tipoResposta === "numero" ? "Número" : "Texto"}</span>
                    {campo.obrigatorio && (
                      <span className="campo-badge obrigatorio">Obrigatório</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-remover"
                  onClick={() => removerCampo(campo.id)}
                >
                  🗑️ Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}