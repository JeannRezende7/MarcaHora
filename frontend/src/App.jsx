import { Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// CSS Global
import './styles/reset-espacos.css';
import "./styles/geral.css"

// Páginas privadas
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Agendamentos from './pages/Agendamentos'
import Clientes from './pages/Clientes'
import Servicos from './pages/Servicos'
import Profissionais from './pages/Profissionais'
import Configuracoes from './pages/Configuracoes'

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
            <nav className="menu">
              <NavLink 
                to="/" 
                className={({ isActive }) => isActive ? 'active' : ''}
                end
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/agendamentos"
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                Agendamentos
              </NavLink>
              <NavLink 
                to="/servicos"
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                Serviços
              </NavLink>
              <NavLink 
                to="/profissionais"
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                Profissionais
              </NavLink>
              <NavLink 
                to="/clientes"
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                Clientes
              </NavLink>
              <NavLink 
                to="/configuracoes"
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                Configurações
              </NavLink>
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
          {/* páginas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* páginas privadas */}
          <Route path="/" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          }/>

          <Route path="/agendamentos" element={
            <PrivateRoute><Agendamentos /></PrivateRoute>
          }/>

          <Route path="/clientes" element={
            <PrivateRoute><Clientes /></PrivateRoute>
          }/>

          <Route path="/servicos" element={
            <PrivateRoute><Servicos /></PrivateRoute>
          }/>

          <Route path="/profissionais" element={
            <PrivateRoute><Profissionais /></PrivateRoute>
          }/>

          <Route path="/configuracoes" element={
            <PrivateRoute><Configuracoes /></PrivateRoute>
          }/>

          {/* páginas públicas de agendamento */}
          <Route path="/public/loja/:id" element={<PublicLoja />} />
          <Route path="/public/horarios/:lojaId/:servicoId" element={<PublicHorarios />} />
          <Route path="/public/confirmar/:lojaId/:servicoId/:dataHora" element={<PublicConfirmar />} />
          <Route path="/public/sucesso" element={<PublicSucesso />} />
        </Routes>
      </main>
    </div>
  )
}