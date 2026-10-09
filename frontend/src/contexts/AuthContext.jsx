import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "include",
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, data };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/user/profile", { credentials: "include" });
      const data = response.ok ? await response.json() : null;
      setUser(data?.success ? data.user : null);
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
      const { data } = await postJson(url, body);
      if (data.success && data.user) {
        setUser(data.user);
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
      await postJson("/api/logout");
    } catch (error) {
      console.error("Erro no logout:", error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin",
    isLoading,
    login,
    signup,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
