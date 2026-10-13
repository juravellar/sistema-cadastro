import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Avatar from "../components/account/Avatar";
import ProfileCard from "../components/account/ProfileCard";
import AccountForm from "../components/account/AccountForm";
import PasswordForm from "../components/account/PasswordForm";

function greetingFor(hour) {
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

function firstName(name = "") {
  return name.trim().split(/\s+/)[0] || name;
}

function Home() {
  const { user, isAdmin, logout, updateUser } = useAuth();

  return (
    <div className="home-page">
      <header className="app-header">
        <div className="container d-flex align-items-center justify-content-between">
          <span className="app-brand">Sistema de Cadastro</span>
          <div className="d-flex align-items-center gap-3">
            <span className="d-none d-sm-flex align-items-center gap-2 header-user">
              <Avatar name={user.username} size="sm" />
              {user.username}
            </span>
            {isAdmin && (
              <Link to="/home-admin" className="btn btn-outline-primary btn-sm">
                Painel admin
              </Link>
            )}
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={logout}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="container py-4">
        <section className="welcome">
          <h1>
            {greetingFor(new Date().getHours())}, {firstName(user.username)}!
          </h1>
          <p>Aqui você confere seus dados e mantém sua conta segura.</p>
        </section>

        <div className="row g-4">
          <div className="col-lg-4">
            <ProfileCard user={user} />
          </div>
          <div className="col-lg-8 d-flex flex-column gap-4">
            <AccountForm user={user} onSaved={updateUser} />
            <PasswordForm />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
