import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/agendamentos.css"

export default function Agendamentos() {
  const { lojaId } = useAuth();
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [lista, setLista] = useState([]);

  useEffect(() => {
    if (!lojaId) return;

    api
      .get(`/api/agendamentos/loja/${lojaId}/data?data=${data}`)
      .then((r) => setLista(r.data))
      .catch(() => setLista([]));
  }, [data, lojaId]);

  return (
    <div className="page">
      <h1>Agendamentos</h1>

      <input type="date" value={data} onChange={(e) => setData(e.target.value)} />

      {lista.length === 0 && <p>Nenhum agendamento neste dia.</p>}

      {lista.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Hora</th>
              <th>Cliente</th>
              <th>Serviço</th>
              <th>Profissional</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((ag) => (
              <tr key={ag.id}>
                <td>{ag.horario}</td>
                <td>{ag.cliente?.nome}</td>
                <td>{ag.servico?.descricao}</td>
                <td>{ag.profissional?.nome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
