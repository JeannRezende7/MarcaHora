import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";

export default function Dashboard() {
  const { lojaId, usuario } = useAuth();
  const [agendamentosHoje, setAgendamentosHoje] = useState([]);
  const [linkPublico, setLinkPublico] = useState("");

  useEffect(() => {
    if (!lojaId) return;

    const hoje = new Date().toISOString().split("T")[0];

    api.get(`/api/agendamentos/loja/${lojaId}/data?data=${hoje}`)
      .then(res => setAgendamentosHoje(res.data))
      .catch(() => setAgendamentosHoje([]));

    setLinkPublico(`http://localhost:5173/public/loja/${lojaId}`);
  }, [lojaId]);

  return (
    <div className="dashboard">

      {/* Saudação */}
      <h2 className="titulo">Bem-vindo, {usuario?.nome?.split(" ")[0]}!</h2>

      {/* Indicadores */}
      <div className="kpi-row">

        <div className="kpi-card">
          <span className="kpi-title">Agendamentos Hoje</span>
          <span className="kpi-number">{agendamentosHoje.length}</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-title">Link de Agendamento</span>
          <input
            className="kpi-input"
            type="text"
            readOnly
            value={linkPublico}
          />
          <small>Compartilhe este link com seus clientes</small>
        </div>

      </div>

      {/* Agendamentos do dia */}
      <div className="section">
        <div className="section-header">
          <h3>Agendamentos de Hoje</h3>
          <button className="btn-light">Ver Todos</button>
        </div>

        <div className="card-empty">
          <img src="/icon-calendar.svg" alt="" />
          <p>Nenhum agendamento para hoje</p>
        </div>
      </div>

      <div className="bottom-grid">

        {/* Ações rápidas */}
        <div className="card">
          <h3>Ações Rápidas</h3>
          <button className="btn-purple">Ver Agenda</button>
          <button className="btn-green">Novo Serviço</button>
          <button className="btn-white">Configurações</button>
        </div>

        {/* Dicas */}
        <div className="card">
          <h3>Dicas</h3>
          <ul className="tips">
            <li>✔ Compartilhe o link nas redes sociais</li>
            <li>✔ Configure seus horários</li>
            <li>✔ Cadastre todos os serviços</li>
            <li>✔ Personalize as cores</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
