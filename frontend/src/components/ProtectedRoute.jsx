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

function RedirectToLogin({ notice }) {
  const { hasSignedOut } = useAuth();
  return <Navigate to="/" replace state={hasSignedOut ? undefined : { notice }} />;
}

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Spinner label="Verificando autenticação..." />;
  if (!isAuthenticated) return <RedirectToLogin notice="Faça login para acessar esta página." />;
  return children;
};

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) return <Spinner label="Verificando permissões..." />;
  if (!isAuthenticated) return <RedirectToLogin notice="Faça login para acessar esta página." />;
  if (!isAdmin) return <Navigate to="/home" replace />;
  return children;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) return <Spinner label="Carregando..." />;
  if (isAuthenticated) return <Navigate to={isAdmin ? "/home-admin" : "/home"} replace />;
  return children;
};
