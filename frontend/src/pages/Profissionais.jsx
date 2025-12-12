import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/profissionais.css";

export default function Profissionais() {
  const { lojaId } = useAuth();
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [profissionalEditando, setProfissionalEditando] = useState(null);
  
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    ativo: true
  });

  useEffect(() => {
    if (!lojaId) return;
    carregar();
  }, [lojaId]);

  async function carregar() {
    setCarregando(true);
    try {
      const resp = await api.get(`/api/profissionais/loja/${lojaId}`);
      setLista(resp.data || []);
    } catch (error) {
      console.error(error);
      setLista([]);
    } finally {
      setCarregando(false);
    }
  }

  function abrirModal(profissional = null) {
    if (profissional) {
      setProfissionalEditando(profissional);
      setForm({
        nome: profissional.nome || "",
        email: profissional.email || "",
        telefone: profissional.telefone || "",
        ativo: profissional.ativo !== false
      });
    } else {
      setProfissionalEditando(null);
      setForm({ nome: "", email: "", telefone: "", ativo: true });
    }
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setProfissionalEditando(null);
    setForm({ nome: "", email: "", telefone: "", ativo: true });
  }

  async function salvar(e) {
    e.preventDefault();
    
    const payload = {
      nome: form.nome,
      email: form.email,
      telefone: form.telefone,
      ativo: form.ativo
    };

    try {
      if (profissionalEditando) {
        await api.put(`/api/profissionais/${profissionalEditando.id}`, payload);
      } else {
        await api.post(`/api/profissionais/loja/${lojaId}`, payload);
      }
      
      await carregar();
      fecharModal();
      alert(profissionalEditando ? 'Profissional atualizado!' : 'Profissional cadastrado!');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar profissional: ' + (error.response?.data || error.message));
    }
  }

  async function deletar(id) {
    if (!confirm('Tem certeza que deseja deletar este profissional?')) return;

    try {
      await api.delete(`/api/profissionais/${id}`);
      await carregar();
      alert('Profissional deletado!');
    } catch (error) {
      console.error(error);
      alert('Erro ao deletar profissional');
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
        <h1>👥 Profissionais</h1>
        <button 
          className="btn-adicionar"
          onClick={() => abrirModal()}
        >
          ➕ Novo Profissional
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
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>👤</div>
          <p style={{ fontSize: '18px', color: '#999', marginBottom: '12px' }}>
            Nenhum profissional cadastrado
          </p>
          <p style={{ fontSize: '14px', color: '#bbb' }}>
            Clique em "Novo Profissional" para começar
          </p>
        </div>
      ) : (
        <ul>
          {lista.map((p) => (
            <li key={p.id}>
              <div>
                <div className="profissional-titulo">
                  {p.nome}
                  {!p.ativo && (
                    <span style={{
                      marginLeft: '12px',
                      padding: '4px 8px',
                      background: '#f44336',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      INATIVO
                    </span>
                  )}
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  marginTop: '8px',
                  fontSize: '14px',
                  color: '#777'
                }}>
                  {p.email && <span>📧 {p.email}</span>}
                  {p.telefone && <span>📱 {p.telefone}</span>}
                </div>
              </div>

              <div className="profissional-acoes">
                <button 
                  className="btn-editar"
                  onClick={() => abrirModal(p)}
                >
                  ✏️ Editar
                </button>
                <button 
                  className="btn-deletar"
                  onClick={() => deletar(p.id)}
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
        <div className="profissional-modal">
          <div className="profissional-modal-content">
            <h2>{profissionalEditando ? '✏️ Editar Profissional' : '➕ Novo Profissional'}</h2>
            
            <form onSubmit={salvar}>
              <div className="form-group">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  placeholder="Ex: João Silva"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  placeholder="joao@exemplo.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={form.ativo}
                    onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <span>Profissional ativo</span>
                </label>
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
                  {profissionalEditando ? '💾 Atualizar' : '➕ Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}