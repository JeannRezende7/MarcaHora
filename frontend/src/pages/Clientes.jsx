import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/clientes.css";

export default function Clientes() {
  const { lojaId } = useAuth();
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (!lojaId) return;
    carregar();
  }, [lojaId]);

  async function carregar() {
    setCarregando(true);
    try {
      const resp = await api.get(`/api/clientes/loja/${lojaId}`);
      setLista(resp.data || []);
    } catch (error) {
      console.error(error);
      setLista([]);
    } finally {
      setCarregando(false);
    }
  }

  const listaFiltrada = lista.filter(cliente => {
    const termoBusca = busca.toLowerCase();
    return (
      cliente.nome?.toLowerCase().includes(termoBusca) ||
      cliente.telefone?.toLowerCase().includes(termoBusca) ||
      cliente.email?.toLowerCase().includes(termoBusca)
    );
  });

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
      <h1>👥 Clientes</h1>

      {/* Busca */}
      {lista.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="🔍 Buscar cliente por nome, telefone ou email..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 20px',
              fontSize: '15px',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              outline: 'none',
              transition: 'border 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>
      )}

      {/* Estatísticas */}
      {lista.length > 0 && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#777', marginBottom: '4px' }}>
                Total de Clientes
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#667eea' }}>
                {lista.length}
              </div>
            </div>
            {busca && (
              <div>
                <div style={{ fontSize: '14px', color: '#777', marginBottom: '4px' }}>
                  Resultados da Busca
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#4caf50' }}>
                  {listaFiltrada.length}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lista Vazia */}
      {lista.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '60px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>👥</div>
          <p style={{ fontSize: '18px', color: '#999', marginBottom: '12px' }}>
            Nenhum cliente cadastrado
          </p>
          <p style={{ fontSize: '14px', color: '#bbb' }}>
            Os clientes aparecerão aqui quando fizerem agendamentos
          </p>
        </div>
      ) : listaFiltrada.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '60px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <p style={{ fontSize: '16px', color: '#999' }}>
            Nenhum cliente encontrado com "{busca}"
          </p>
        </div>
      ) : (
        <ul>
          {listaFiltrada.map((c) => (
            <li key={c.id}>
              <div className="cliente-info">
                <div className="cliente-nome">
                  {c.nome || 'Sem nome'}
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  flexWrap: 'wrap',
                  marginTop: '8px'
                }}>
                  {c.telefone && (
                    <span className="cliente-contato">
                      📱 {c.telefone}
                    </span>
                  )}
                  {c.email && (
                    <span className="cliente-contato">
                      📧 {c.email}
                    </span>
                  )}
                </div>
              </div>

              <div className="cliente-acoes">
                <button 
                  className="btn-editar"
                  onClick={() => alert('Funcionalidade em desenvolvimento')}
                >
                  ✏️ Ver Histórico
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}