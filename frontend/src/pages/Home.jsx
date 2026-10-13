import { useAuth } from "../contexts/AuthContext";

function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="content-container">
      <div className="container mt-4">
        <h1>Bem-vindo, {user?.username || user?.email}!</h1>
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-primary" onClick={logout}>
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
