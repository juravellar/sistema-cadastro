import { useState } from "react";
import { apiRequest } from "../../lib/api";

const MIN_LENGTH = 8;
const EMPTY = { currentPassword: "", newPassword: "", confirmPassword: "" };

function PasswordForm() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < MIN_LENGTH) {
      setStatus({ type: "danger", message: `A nova senha deve ter pelo menos ${MIN_LENGTH} caracteres.` });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setStatus({ type: "danger", message: "A confirmação não confere com a nova senha." });
      return;
    }

    setIsSaving(true);
    const { ok, data } = await apiRequest("PUT", "/api/user/password", {
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
    setIsSaving(false);

    if (!ok) {
      setStatus({ type: "danger", message: data.message || "Erro ao alterar a senha" });
      return;
    }
    setForm(EMPTY);
    setStatus({ type: "success", message: "Senha alterada. Suas outras sessões foram encerradas." });
  };

  return (
    <section className="soft-card" aria-labelledby="password-title">
      <h3 id="password-title" className="card-heading">
        Alterar senha
      </h3>
      <p className="card-subtitle">
        Ao trocar a senha, você continua conectado aqui e é desconectado nos outros dispositivos.
      </p>

      <form onSubmit={handleSubmit}>
        {status && (
          <div className={`alert alert-${status.type}`} role={status.type === "danger" ? "alert" : "status"}>
            {status.message}
          </div>
        )}
        <div className="row g-3">
          <div className="col-12">
            <label htmlFor="currentPassword" className="form-label">
              Senha atual
            </label>
            <input
              id="currentPassword"
              type="password"
              className="form-control"
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={update("currentPassword")}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="newPassword" className="form-label">
              Nova senha
            </label>
            <input
              id="newPassword"
              type="password"
              className="form-control"
              autoComplete="new-password"
              value={form.newPassword}
              onChange={update("newPassword")}
              aria-describedby="newPasswordHelp"
              required
            />
            <div id="newPasswordHelp" className="form-text">
              Mínimo de {MIN_LENGTH} caracteres.
            </div>
          </div>
          <div className="col-md-6">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar nova senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="form-control"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              required
            />
          </div>
        </div>
        <div className="d-flex justify-content-end mt-3">
          <button type="submit" className="btn btn-primary px-4" disabled={isSaving}>
            {isSaving ? "Alterando..." : "Alterar senha"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default PasswordForm;
