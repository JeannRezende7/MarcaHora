import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Servicos() {
  const { lojaId } = useAuth();
  const [lista, setLista] = useState([]);

  async function carregar() {
    if (!lojaId) return;

    try {
      const resp = await api.get(`/api/servicos/loja/${lojaId}`);
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
      <h1>Serviços</h1>

      {lista.length === 0 && <p>Nenhum serviço encontrado.</p>}

      {lista.length > 0 && (
        <ul>
          {lista.map((s) => (
            <li key={s.id}>{s.descricao} - R$ {s.preco}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
