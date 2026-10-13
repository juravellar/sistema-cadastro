import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Spinner({ label }) {
  return (
    <div className="content-container">
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">{label}</span>
        </div>
      </div>
    </div>
  );
}

const NOTICES = {
  expired: "Sua sessão foi encerrada. Entre novamente.",
  missing: "Faça login para acessar esta página.",
};

function RedirectToLogin() {
  const { sessionEnd } = useAuth();
  if (sessionEnd === "signedOut") return <Navigate to="/" replace />;
  const notice = sessionEnd === "expired" ? NOTICES.expired : NOTICES.missing;
  return <Navigate to="/" replace state={{ notice }} />;
}

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Spinner label="Verificando autenticação..." />;
  if (!isAuthenticated) return <RedirectToLogin />;
  return children;
};

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) return <Spinner label="Verificando permissões..." />;
  if (!isAuthenticated) return <RedirectToLogin />;
  if (!isAdmin) return <Navigate to="/home" replace />;
  return children;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) return <Spinner label="Carregando..." />;
  if (isAuthenticated) return <Navigate to={isAdmin ? "/home-admin" : "/home"} replace />;
  return children;
};
