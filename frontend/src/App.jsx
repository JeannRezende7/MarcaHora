import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Estilo geral
import "./styles/geral.css"

// Páginas privadas
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Agendamentos from './pages/Agendamentos'
import Clientes from './pages/Clientes'
import Servicos from './pages/Servicos'

// Páginas públicas
import Cadastro from './pages/Cadastro'
import PublicLoja from './pages/PublicLoja'
import PublicHorarios from './pages/PublicHorarios'
import PublicConfirmar from './pages/PublicConfirmar'
import PublicSucesso from './pages/PublicSucesso'


function PrivateRoute({ children }) {
  const { usuario } = useAuth()
  return usuario ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { usuario, logout } = useAuth()

  return (
    <div className="app">

      {usuario && (
        <header className="topbar">
          <div className="topbar-left">
            <span className="logo">MarcaHora</span>

            <nav className="menu">
              <Link to="/">Dashboard</Link>
              <Link to="/agendamentos">Agendamentos</Link>
              <Link to="/clientes">Clientes</Link>
              <Link to="/servicos">Serviços</Link>
            </nav>
          </div>

          <div className="topbar-right">
            <span>{usuario.lojaNome}</span>
            <button onClick={logout}>Sair</button>
          </div>
        </header>
      )}

      <main className="main-container">
        <Routes>

          {/* Telas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* Telas Privadas */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/agendamentos" element={<PrivateRoute><Agendamentos /></PrivateRoute>} />
          <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
          <Route path="/servicos" element={<PrivateRoute><Servicos /></PrivateRoute>} />

          {/* Telas Públicas do Agendamento Externo */}
          <Route path="/public/loja/:id" element={<PublicLoja />} />
          <Route path="/public/loja/:lojaId/servico/:servicoId" element={<PublicHorarios />} />
          <Route path="/public/confirmar/:lojaId/:servicoId/:dataHora" element={<PublicConfirmar />} />
          <Route path="/public/sucesso" element={<PublicSucesso />} />

        </Routes>
      </main>
    </div>
  )
}
