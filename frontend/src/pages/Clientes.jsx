import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/clientes.css"

export default function Clientes() {
  const { lojaId } = useAuth();
  const [lista, setLista] = useState([]);

  async function carregar() {
    if (!lojaId) return;

    try {
      const resp = await api.get(`/api/clientes/loja/${lojaId}`);
      setLista(resp.data);
    } catch (error) {
      console.error(error);
      setLista([]);
    }
  }

  useEffect(() => {
    carregar();
  }, [lojaId]);

  return (
    <div className="page">
      <h1>Clientes</h1>

      {lista.length === 0 && <p>Nenhum cliente encontrado.</p>}

      {lista.length > 0 && (
        <ul>
          {lista.map((c) => (
            <li key={c.id}>{c.nome}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
