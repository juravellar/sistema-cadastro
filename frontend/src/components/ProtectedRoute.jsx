import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

let hasShownAuthAlert = false;
let hasShownAdminAlert = false;

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="content-container">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Verificando autenticação...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (!hasShownAuthAlert) {
      alert("⚠️ Entrada indevida! Faça login primeiro.");
      hasShownAuthAlert = true;
      setTimeout(() => {
        hasShownAuthAlert = false;
      }, 500);
    }
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="content-container">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Verificando permissões...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (!hasShownAdminAlert) {
      alert(
        "⚠️ Acesso negado! Apenas administradores podem acessar esta página. Faça login primeiro."
      );
      hasShownAdminAlert = true;
      setTimeout(() => {
        hasShownAdminAlert = false;
      }, 500);
    }
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    if (!hasShownAdminAlert) {
      alert(
        "⚠️ Acesso negado! Apenas administradores podem acessar esta página."
      );
      hasShownAdminAlert = true;
      setTimeout(() => {
        hasShownAdminAlert = false;
      }, 500);
    }
    return <Navigate to="/home" state={{ from: location }} replace />;
  }

  return children;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="content-container">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  // Permite acesso à página de login mesmo quando logado
  // Remove o redirecionamento automático
  return children;
};
