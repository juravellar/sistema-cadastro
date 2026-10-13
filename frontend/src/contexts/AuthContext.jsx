import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiRequest, AUTH_CHANGED_EVENT } from "../lib/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

const fetchProfile = () =>
  apiRequest("GET", "/api/user/profile", undefined, { notifyAuthChange: false });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // Por que a sessão acabou: "signedOut" (botão Sair) ou "expired" (encerrada no
  // servidor). Os guards de rota usam isso para escolher o aviso da tela de login.
  const [sessionEnd, setSessionEnd] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      const { ok, data } = await fetchProfile();
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

  useEffect(() => {
    const revalidate = async () => {
      try {
        const { ok, data } = await fetchProfile();
        if (ok && data.success) {
          setUser(data.user);
          return;
        }
        setSessionEnd("expired");
        setUser(null);
      } catch (error) {
        console.error("Erro ao revalidar a sessão:", error);
      }
    };
    window.addEventListener(AUTH_CHANGED_EVENT, revalidate);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, revalidate);
  }, []);

  const authenticate = async (url, body, fallbackMessage) => {
    try {
      const { data } = await apiRequest("POST", url, body, { notifyAuthChange: false });
      if (data.success && data.user) {
        setUser(data.user);
        setSessionEnd(null);
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
      await apiRequest("POST", "/api/logout", undefined, { notifyAuthChange: false });
    } catch (error) {
      console.error("Erro no logout:", error);
    } finally {
      setSessionEnd("signedOut");
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin",
    isLoading,
    sessionEnd,
    login,
    signup,
    logout,
    checkAuth,
    updateUser: setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
