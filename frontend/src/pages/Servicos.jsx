import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/servicos.css";

export default function Servicos() {
  const { lojaId } = useAuth();
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [servicoEditando, setServicoEditando] = useState(null);
  
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    preco: "",
    duracaoMinutos: ""
  });

  useEffect(() => {
    if (!lojaId) return;
    carregar();
  }, [lojaId]);

  async function carregar() {
    setCarregando(true);
    try {
      const resp = await api.get(`/api/servicos/loja/${lojaId}`);
      setLista(resp.data || []);
    } catch (error) {
      console.error(error);
      setLista([]);
    } finally {
      setCarregando(false);
    }
  }

  function abrirModal(servico = null) {
    if (servico) {
      setServicoEditando(servico);
      setForm({
        nome: servico.nome || "",
        descricao: servico.descricao || "",
        preco: servico.preco || "",
        duracaoMinutos: servico.duracaoMinutos || ""
      });
    } else {
      setServicoEditando(null);
      setForm({ nome: "", descricao: "", preco: "", duracaoMinutos: "" });
    }
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setServicoEditando(null);
    setForm({ nome: "", descricao: "", preco: "", duracaoMinutos: "" });
  }

  async function salvar(e) {
    e.preventDefault();
    
    const payload = {
      nome: form.nome,
      descricao: form.descricao,
      preco: parseFloat(form.preco) || 0,
      duracaoMinutos: parseInt(form.duracaoMinutos) || 0
    };

    try {
      if (servicoEditando) {
        // Atualizar serviço existente
        await api.put(`/api/servicos/${servicoEditando.id}`, payload);
      } else {
        // Criar novo serviço
        await api.post(`/api/servicos/loja/${lojaId}`, payload);
      }
      
      await carregar();
      fecharModal();
      alert(servicoEditando ? 'Serviço atualizado!' : 'Serviço criado!');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar serviço: ' + (error.response?.data || error.message));
    }
  }

  async function deletar(id) {
    if (!confirm('Tem certeza que deseja deletar este serviço?')) return;

    try {
      await api.delete(`/api/servicos/${id}`);
      await carregar();
      alert('Serviço deletado!');
    } catch (error) {
      console.error(error);
      alert('Erro ao deletar serviço');
    }
  }

  if (carregando) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px' }}>⏳</div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1>✨ Serviços</h1>
        <button 
          className="btn-adicionar"
          onClick={() => abrirModal()}
        >
          ➕ Novo Serviço
        </button>
      </div>

      {lista.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '60px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📦</div>
          <p style={{ fontSize: '18px', color: '#999', marginBottom: '12px' }}>
            Nenhum serviço cadastrado
          </p>
          <p style={{ fontSize: '14px', color: '#bbb' }}>
            Clique em "Novo Serviço" para começar
          </p>
        </div>
      ) : (
        <ul>
          {lista.map((s) => (
            <li key={s.id}>
              <div>
                <div className="servico-titulo">
                  {s.nome || s.descricao}
                </div>
                {s.preco > 0 && (
                  <div className="servico-preco">
                    R$ {s.preco.toFixed(2)}
                  </div>
                )}
                {s.duracaoMinutos > 0 && (
                  <div className="servico-duracao">
                    ⏱️ {s.duracaoMinutos} minutos
                  </div>
                )}
                {s.descricao && s.nome && (
                  <div className="servico-descricao">
                    {s.descricao}
                  </div>
                )}
              </div>

              <div className="servico-acoes">
                <button 
                  className="btn-editar"
                  onClick={() => abrirModal(s)}
                >
                  ✏️ Editar
                </button>
                <button 
                  className="btn-deletar"
                  onClick={() => deletar(s.id)}
                >
                  🗑️ Deletar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* MODAL */}
      {modalAberto && (
        <div className="servico-modal">
          <div className="servico-modal-content">
            <h2>{servicoEditando ? '✏️ Editar Serviço' : '➕ Novo Serviço'}</h2>
            
            <form onSubmit={salvar}>
              <div className="form-group">
                <label>Nome do Serviço *</label>
                <input
                  type="text"
                  placeholder="Ex: Corte de Cabelo"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  placeholder="Descreva o serviço (opcional)"
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Preço (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.preco}
                  onChange={(e) => setForm({ ...form, preco: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Duração (minutos) *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="30"
                  value={form.duracaoMinutos}
                  onChange={(e) => setForm({ ...form, duracaoMinutos: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={fecharModal}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#f0f0f0',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '15px'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '15px'
                  }}
                >
                  {servicoEditando ? '💾 Atualizar' : '➕ Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}