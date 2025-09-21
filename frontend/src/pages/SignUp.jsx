import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validação de senha
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        navigate(data.redirectTo || "/home");
      } else {
        setError(data.message || "Erro ao criar conta!");
      }
    } catch (error) {
      console.error("Erro:", error);
      setError("Erro ao criar conta!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="main-container">
        <div className="form-container">
          <h2 className="form-title">Criar conta</h2>
          <p className="form-subtitle">Crie uma conta para continuar.</p>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="signup-username" className="form-label">
                Nome de usuário
              </label>
              <input
                type="text"
                className="form-control"
                id="signup-username"
                placeholder="Digite seu nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="signup-email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="signup-email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="signup-password" className="form-label">
                Senha
              </label>
              <input
                type="password"
                className="form-control"
                id="signup-password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
                disabled={isLoading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="signup-confirm" className="form-label">
                Confirme a senha
              </label>
              <input
                type="password"
                className="form-control"
                id="signup-confirm"
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isLoading}
            >
              {isLoading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
