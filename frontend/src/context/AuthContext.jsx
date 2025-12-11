import api from "../services/api";
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  async function loginRequest(email, senha) {
    const resp = await api.post("/api/auth/login", { email, senha });
    setUsuario(resp.data);
  }

  function logout() {
    setUsuario(null);
  }

  function atualizarLojaNoContexto(novoNome) {
    if (usuario) {
      setUsuario({
        ...usuario,
        nomeLoja: novoNome
      });
    }
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        lojaId: usuario?.lojaId ?? null,
        loginRequest,
        logout,
        atualizarLojaNoContexto,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}