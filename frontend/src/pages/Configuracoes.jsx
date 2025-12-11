// src/pages/Configuracoes.jsx
import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"
import "../styles/configuracoes.css";

export default function Configuracoes() {
  const { usuario, atualizarLojaNoContexto } = useAuth()
  const lojaId = usuario?.lojaId

  // =========================
  // Estados das seções
  // =========================

  const [infoLoja, setInfoLoja] = useState({
    nome: "",
    telefone: "",
    email: "",
    logoUrl: "",
    corPrimaria: "#4F46E5",
    corSecundaria: "#10B981",
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

  const [configModos, setConfigModos] = useState({
    usaServicos: true,
    usaProfissionais: false,
    mostrarObservacoes: true,
  })

  const [camposPersonalizados, setCamposPersonalizados] = useState([])
  const [novoCampo, setNovoCampo] = useState({
    pergunta: "",
    tipoResposta: "texto",
    obrigatorio: false,
  })

  const diasSemana = [
    { valor: "7", rotulo: "Domingo" },
    { valor: "1", rotulo: "Segunda" },
    { valor: "2", rotulo: "Terça" },
    { valor: "3", rotulo: "Quarta" },
    { valor: "4", rotulo: "Quinta" },
    { valor: "5", rotulo: "Sexta" },
    { valor: "6", rotulo: "Sábado" },
  ]

  // ===================================================
  // 🔥 1) CARREGAR CONFIGURAÇÕES AO ABRIR A PÁGINA
  // ===================================================
  useEffect(() => {
    if (!lojaId) return

    async function carregar() {
      try {
        const resp = await api.get(`/api/configuracoes/${lojaId}`)
        const cfg = resp.data

        setInfoLoja({
          nome: cfg.nome,
          telefone: cfg.telefone || "",
          email: cfg.email || "",
          logoUrl: cfg.logoUrl || "",
          corPrimaria: cfg.corPrimaria || "#4F46E5",
          corSecundaria: cfg.corSecundaria || "#10B981",
        })

        setHorarios({
          abertura: cfg.horarioAbertura || "09:00",
          fechamento: cfg.horarioFechamento || "18:00",
          intervalo: cfg.intervaloAtendimento || 30,
          buffer: cfg.tempoBufferMinutos || 0,
          dias: cfg.diasFuncionamento || [],
        })

        setCamposCliente({
          obrigarNome: cfg.obrigarNome,
          obrigarEmail: cfg.obrigarEmail,
          obrigarTelefone: cfg.obrigarTelefone,
        })

        setConfigModos({
          usaServicos: cfg.usaServicos,
          usaProfissionais: cfg.usaProfissionais,
          mostrarObservacoes: cfg.mostrarObservacoes,
        })

        setCamposPersonalizados(cfg.camposPersonalizados || [])
      } catch (err) {
        console.error("Falha ao carregar configurações", err)
      }
    }

    carregar()
  }, [lojaId])

  // ===================================================
  // 🔥 2) SALVAR INFORMAÇÕES DA LOJA
  // ===================================================
  async function salvarInfoLoja(e) {
    e.preventDefault()
    try {
      await api.put(`/api/configuracoes/${lojaId}/info`, infoLoja)

      atualizarLojaNoContexto(infoLoja.nome)

      alert("Informações da loja salvas!")
    } catch (err) {
      console.error(err)
      alert("Erro ao salvar informações.")
    }
  }

  // ===================================================
  // 🔥 3) SALVAR HORÁRIOS
  // ===================================================
  async function salvarHorarios(e) {
    e.preventDefault()
    try {
      await api.put(`/api/configuracoes/${lojaId}/horarios`, {
        abertura: horarios.abertura,
        fechamento: horarios.fechamento,
        intervalo: horarios.intervalo,
        buffer: horarios.buffer,
        dias: horarios.dias,
      })

      alert("Horários atualizados!")
    } catch (err) {
      console.error(err)
      alert("Erro ao salvar horários.")
    }
  }

  // ===================================================
  // 🔥 4) SALVAR CAMPOS OBRIGATÓRIOS
  // ===================================================
  async function salvarCamposCliente(e) {
    e.preventDefault()
    try {
      await api.put(`/api/configuracoes/${lojaId}/campos-obrigatorios`, camposCliente)
      alert("Configuração salva!")
    } catch (err) {
      console.error(err)
      alert("Erro ao salvar campos obrigatórios.")
    }
  }

  // ===================================================
  // 🔥 5) SALVAR CONFIGURAÇÃO DE MODOS
  // ===================================================
  async function salvarModos(e) {
    e.preventDefault()
    try {
      await api.put(`/api/configuracoes/${lojaId}/modos`, configModos)
      alert("Modos salvos!")
    } catch (err) {
      console.error(err)
      alert("Erro ao salvar modos.")
    }
  }

  // ===================================================
  // 🔥 6) CAMPOS PERSONALIZADOS — ADICIONAR
  // ===================================================
  async function adicionarCampo(e) {
    e.preventDefault()

    if (!novoCampo.pergunta.trim()) {
      alert("Digite a pergunta.")
      return
    }

    try {
      const resp = await api.post(`/api/configuracoes/${lojaId}/campos-personalizados`, novoCampo)
      setCamposPersonalizados((old) => [...old, resp.data])

      setNovoCampo({ pergunta: "", tipoResposta: "texto", obrigatorio: false })
    } catch (err) {
      console.error(err)
      alert("Erro ao adicionar campo.")
    }
  }

  // ===================================================
  // 🔥 7) CAMPOS PERSONALIZADOS — REMOVER
  // ===================================================
  async function removerCampo(id) {
    try {
      await api.delete(`/api/configuracoes/${lojaId}/campos-personalizados/${id}`)

      setCamposPersonalizados((lista) => lista.filter((c) => c.id !== id))
    } catch (err) {
      console.error(err)
      alert("Erro ao remover campo.")
    }
  }

  // ===================================================
  // RENDERIZAÇÃO
  // ===================================================
  return (
    <div className="page">
      <h1>Configurações</h1>

      {/* ------------------------------------ */}
      {/* 1. INFORMAÇÕES DA LOJA */}
      {/* ------------------------------------ */}
      <div className="card">
        <h2>Informações da Loja</h2>

        <form onSubmit={salvarInfoLoja}>
          <div className="form-group">
            <label>Nome *</label>
            <input
              type="text"
              className="form-input"
              value={infoLoja.nome}
              onChange={(e) =>
                setInfoLoja({ ...infoLoja, nome: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Telefone</label>
            <input
              type="text"
              className="form-input"
              value={infoLoja.telefone}
              onChange={(e) =>
                setInfoLoja({ ...infoLoja, telefone: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              className="form-input"
              value={infoLoja.email}
              onChange={(e) =>
                setInfoLoja({ ...infoLoja, email: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Logo URL</label>
            <input
              type="url"
              className="form-input"
              value={infoLoja.logoUrl}
              onChange={(e) =>
                setInfoLoja({ ...infoLoja, logoUrl: e.target.value })
              }
            />
          </div>

          <button className="btn-primary">Salvar</button>
        </form>
      </div>

      {/* ------------------------------------ */}
      {/* 2. HORÁRIOS */}
      {/* ------------------------------------ */}

      <div className="card">
        <h2>Horários de Funcionamento</h2>

        <form onSubmit={salvarHorarios}>
          <div className="row-2">
            <div className="form-group">
              <label>Abertura *</label>
              <input
                type="time"
                className="form-input"
                value={horarios.abertura}
                onChange={(e) =>
                  setHorarios({ ...horarios, abertura: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Fechamento *</label>
              <input
                type="time"
                className="form-input"
                value={horarios.fechamento}
                onChange={(e) =>
                  setHorarios({ ...horarios, fechamento: e.target.value })
                }
              />
            </div>
          </div>

          <div className="row-2">
            <div className="form-group">
              <label>Intervalo (min)</label>
              <input
                type="number"
                className="form-input"
                value={horarios.intervalo}
                onChange={(e) =>
                  setHorarios({
                    ...horarios,
                    intervalo: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Buffer (min)</label>
              <input
                type="number"
                className="form-input"
                value={horarios.buffer}
                onChange={(e) =>
                  setHorarios({
                    ...horarios,
                    buffer: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>Dias de Funcionamento</label>

            <div className="dias-grid">
              {diasSemana.map((dia) => (
                <label key={dia.valor} className="form-checkbox">
                  <input
                    type="checkbox"
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
                  {dia.rotulo}
                </label>
              ))}
            </div>
          </div>

          <button className="btn-primary">Salvar Horários</button>
        </form>
      </div>

      {/* ------------------------------------ */}
      {/* 3. CAMPOS OBRIGATÓRIOS */}
      {/* ------------------------------------ */}

      <div className="card">
        <h2>Campos Obrigatórios</h2>

        <form onSubmit={salvarCamposCliente}>
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={camposCliente.obrigarNome}
              onChange={(e) =>
                setCamposCliente({
                  ...camposCliente,
                  obrigarNome: e.target.checked,
                })
              }
            />
            Nome obrigatório
          </label>

          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={camposCliente.obrigarEmail}
              onChange={(e) =>
                setCamposCliente({
                  ...camposCliente,
                  obrigarEmail: e.target.checked,
                })
              }
            />
            Email obrigatório
          </label>

          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={camposCliente.obrigarTelefone}
              onChange={(e) =>
                setCamposCliente({
                  ...camposCliente,
                  obrigarTelefone: e.target.checked,
                })
              }
            />
            Telefone obrigatório
          </label>

          <button className="btn-primary">Salvar</button>
        </form>
      </div>

      {/* ------------------------------------ */}
      {/* 4. MODOS DO NEGÓCIO */}
      {/* ------------------------------------ */}

      <div className="card">
        <h2>Modos do Negócio</h2>

        <form onSubmit={salvarModos}>
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={configModos.usaServicos}
              onChange={(e) =>
                setConfigModos({
                  ...configModos,
                  usaServicos: e.target.checked,
                })
              }
            />
            Usar sistema de serviços
          </label>

          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={configModos.usaProfissionais}
              onChange={(e) =>
                setConfigModos({
                  ...configModos,
                  usaProfissionais: e.target.checked,
                })
              }
            />
            Usar profissionais
          </label>

          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={configModos.mostrarObservacoes}
              onChange={(e) =>
                setConfigModos({
                  ...configModos,
                  mostrarObservacoes: e.target.checked,
                })
              }
            />
            Mostrar campo de observações
          </label>

          <button className="btn-primary">Salvar</button>
        </form>
      </div>

      {/* ------------------------------------ */}
      {/* 5. CAMPOS PERSONALIZADOS */}
      {/* ------------------------------------ */}

      <div className="card">
        <h2>Campos Personalizados</h2>

        {camposPersonalizados.length > 0 &&
          camposPersonalizados.map((campo) => (
            <div key={campo.id} className="campo-item">
              <div>
                <strong>{campo.pergunta}</strong>
                {campo.obrigatorio && (
                  <span style={{ color: "red", marginLeft: 6 }}>*</span>
                )}
                <div className="campo-tipo">Tipo: {campo.tipoResposta}</div>
              </div>

              <button
                className="btn-danger"
                onClick={() => removerCampo(campo.id)}
              >
                Remover
              </button>
            </div>
          ))}

        {/* Adicionar novo campo */}
        <form onSubmit={adicionarCampo} style={{ marginTop: "1rem" }}>
          <div className="form-group">
            <label>Pergunta *</label>
            <input
              type="text"
              className="form-input"
              value={novoCampo.pergunta}
              onChange={(e) =>
                setNovoCampo({ ...novoCampo, pergunta: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Tipo de Resposta</label>
            <select
              className="form-input"
              value={novoCampo.tipoResposta}
              onChange={(e) =>
                setNovoCampo({ ...novoCampo, tipoResposta: e.target.value })
              }
            >
              <option value="texto">Texto Livre</option>
              <option value="sim-nao">Sim / Não</option>
            </select>
          </div>

          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={novoCampo.obrigatorio}
              onChange={(e) =>
                setNovoCampo({ ...novoCampo, obrigatorio: e.target.checked })
              }
            />
            Campo obrigatório
          </label>

          <button className="btn-primary" type="submit">
            Adicionar
          </button>
        </form>
      </div>
    </div>
  )
}