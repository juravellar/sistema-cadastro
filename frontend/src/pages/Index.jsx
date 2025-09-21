import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Index() {
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Estados para Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState({});

  // Estados para SignUp
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupErrors, setSignupErrors] = useState({});

  // Função para validar email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Função para limpar erros
  const clearErrors = () => {
    setError("");
    setLoginErrors({});
    setSignupErrors({});
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setLoginErrors({});

    // Validação de campos obrigatórios
    const errors = {};

    if (!loginEmail.trim()) {
      errors.email = "Por favor, insira um email válido.";
    } else if (!validateEmail(loginEmail)) {
      errors.email = "Por favor, insira um email válido.";
    }

    if (!loginPassword.trim()) {
      errors.password = "Por favor, insira sua senha.";
    }

    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        navigate(data.redirectTo || "/home");
      } else {
        setError(data.message || "Credenciais inválidas!");
      }
    } catch (error) {
      console.error("Erro:", error);
      setError("Erro ao fazer login!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSignupErrors({});

    // Validação de campos obrigatórios
    const errors = {};

    if (!signupUsername.trim()) {
      errors.username = "Por favor, insira seu nome de usuário.";
    }

    if (!signupEmail.trim()) {
      errors.email = "Por favor, insira um email válido.";
    } else if (!validateEmail(signupEmail)) {
      errors.email = "Por favor, insira um email válido.";
    }

    if (!signupPassword.trim()) {
      errors.password = "A senha deve ter pelo menos 6 caracteres.";
    } else if (signupPassword.length < 6) {
      errors.password = "A senha deve ter pelo menos 6 caracteres.";
    }

    if (!signupConfirmPassword.trim()) {
      errors.confirmPassword = "As senhas não coincidem.";
    } else if (signupPassword !== signupConfirmPassword) {
      errors.confirmPassword = "As senhas não coincidem.";
    }

    if (Object.keys(errors).length > 0) {
      setSignupErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: signupUsername,
          email: signupEmail,
          password: signupPassword,
        }),
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
    <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 p-3">
      <div className="main-container">
        <ul className="nav nav-tabs" id="authTabs" role="tablist">
          <li className="nav-item flex-fill" role="presentation">
            <button
              className={`nav-link w-100 ${
                activeTab === "login" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("login");
                clearErrors();
              }}
              type="button"
            >
              Login
            </button>
          </li>
          <li className="nav-item flex-fill" role="presentation">
            <button
              className={`nav-link w-100 ${
                activeTab === "signup" ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab("signup");
                clearErrors();
              }}
              type="button"
            >
              Criar conta
            </button>
          </li>
        </ul>

        <div className="tab-content" id="authTabContent">
          {activeTab === "login" && (
            <div className="tab-pane show active" role="tabpanel">
              <div className="form-container">
                <h2 className="form-title">Entrar</h2>
                <p className="form-subtitle">Faça login para continuar.</p>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} noValidate>
                  <div className="mb-3">
                    <label htmlFor="login-email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      className={`form-control ${
                        loginErrors.email ? "is-invalid" : ""
                      }`}
                      id="login-email"
                      placeholder="Digite seu email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    {loginErrors.email && (
                      <div className="invalid-feedback">
                        {loginErrors.email}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="login-password" className="form-label">
                      Senha
                    </label>
                    <input
                      type="password"
                      className={`form-control ${
                        loginErrors.password ? "is-invalid" : ""
                      }`}
                      id="login-password"
                      placeholder="Digite sua senha"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    {loginErrors.password && (
                      <div className="invalid-feedback">
                        {loginErrors.password}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 mb-2"
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "signup" && (
            <div className="tab-pane show active" role="tabpanel">
              <div className="form-container">
                <h2 className="form-title">Criar conta</h2>
                <p className="form-subtitle">Crie uma conta para continuar.</p>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSignUp} noValidate>
                  <div className="mb-3">
                    <label htmlFor="signup-username" className="form-label">
                      Nome de usuário
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        signupErrors.username ? "is-invalid" : ""
                      }`}
                      id="signup-username"
                      placeholder="Digite seu nome de usuário"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    {signupErrors.username && (
                      <div className="invalid-feedback">
                        {signupErrors.username}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="signup-email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      className={`form-control ${
                        signupErrors.email ? "is-invalid" : ""
                      }`}
                      id="signup-email"
                      placeholder="Digite seu email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    {signupErrors.email && (
                      <div className="invalid-feedback">
                        {signupErrors.email}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="signup-password" className="form-label">
                      Senha
                    </label>
                    <input
                      type="password"
                      className={`form-control ${
                        signupErrors.password ? "is-invalid" : ""
                      }`}
                      id="signup-password"
                      placeholder="Digite sua senha"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      minLength="6"
                      disabled={isLoading}
                    />
                    {signupErrors.password && (
                      <div className="invalid-feedback">
                        {signupErrors.password}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="signup-confirm" className="form-label">
                      Confirme a senha
                    </label>
                    <input
                      type="password"
                      className={`form-control ${
                        signupErrors.confirmPassword ? "is-invalid" : ""
                      }`}
                      id="signup-confirm"
                      placeholder="Confirme sua senha"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    {signupErrors.confirmPassword && (
                      <div className="invalid-feedback">
                        {signupErrors.confirmPassword}
                      </div>
                    )}
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
          )}
        </div>
      </div>
    </div>
  );
}

export default Index;
