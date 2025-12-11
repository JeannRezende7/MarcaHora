import { Link } from "react-router-dom";

export default function PublicSucesso() {
  return (
    <div className="public-sucesso-container">
      <div className="sucesso-card">

        <div className="check-animation">✔</div>

        <h1>Agendamento Confirmado!</h1>
        <p>
          Seu horário foi reservado com sucesso.  
          A loja já recebeu todas as informações.
        </p>

        <Link to="/public/loja/1" className="btn-voltar">
          Voltar para a Página Inicial
        </Link>

      </div>
    </div>
  );
}
