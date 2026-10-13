import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiRequest } from "../lib/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // Distingue "saiu pelo botão Sair" de "tentou abrir página protegida sem login",
  // para os guards de rota não exibirem aviso de acesso indevido após o logout.
  const [hasSignedOut, setHasSignedOut] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const { ok, data } = await apiRequest("GET", "/api/user/profile");
      setUser(ok && data.success ? data.user : null);
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const authenticate = async (url, body, fallbackMessage) => {
    try {
      const { data } = await apiRequest("POST", url, body);
      if (data.success && data.user) {
        setUser(data.user);
        setHasSignedOut(false);
        return { success: true, redirectTo: data.redirectTo };
      }
      return { success: false, message: data.message || fallbackMessage };
    } catch (error) {
      console.error(fallbackMessage, error);
      return { success: false, message: "Erro ao conectar com o servidor" };
    }
  };

  const login = (email, password) =>
    authenticate("/api/login", { email, password }, "Erro ao fazer login");

  const signup = (username, email, password) =>
    authenticate("/api/signup", { username, email, password }, "Erro ao criar conta");

  const logout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
    } catch (error) {
      console.error("Erro no logout:", error);
    } finally {
      setHasSignedOut(true);
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin",
    isLoading,
    hasSignedOut,
    login,
    signup,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
