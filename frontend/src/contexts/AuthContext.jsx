import { createContext, useContext, useState, useEffect } from "react";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Debug: verificar cookies antes de fazer a requisição
      const cookies = document.cookie;
      if (cookies) {
        console.log("Cookies disponíveis:", cookies);
      } else {
        console.warn("Nenhum cookie disponível no navegador");
      }

      const response = await fetch("/api/user/profile", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
          setIsAdmin(data.user.email.includes("@admin"));
        } else {
          clearAuth();
        }
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      // Nota: response.headers.get("set-cookie") não funciona no navegador por segurança
      // O cookie é salvo automaticamente pelo navegador se o servidor enviar Set-Cookie

      // Verifica se a resposta tem conteúdo antes de tentar fazer parse
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Resposta não é JSON:", text);
        return {
          success: false,
          message: "Erro ao processar resposta do servidor",
        };
      }

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        setIsAdmin(data.user.email.includes("@admin"));

        // Pequeno delay para garantir que o cookie seja salvo antes de redirecionar
        await new Promise((resolve) => setTimeout(resolve, 100));

        return { success: true, redirectTo: data.redirectTo };
      } else {
        return {
          success: false,
          message: data.message || "Erro ao fazer login",
        };
      }
    } catch (error) {
      console.error("Erro no login:", error);
      return {
        success: false,
        message: error.message || "Erro ao conectar com o servidor",
      };
    }
  };

  const signup = async (username, email, password) => {
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        setIsAdmin(data.user.email.includes("@admin"));
        return { success: true, redirectTo: data.redirectTo };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Erro no signup:", error);
      return { success: false, message: "Erro ao criar conta" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Erro no logout:", error);
    } finally {
      clearAuth();
    }
  };

  const clearAuth = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    login,
    signup,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
