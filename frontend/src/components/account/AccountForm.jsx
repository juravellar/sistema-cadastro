import { useState } from "react";
import { apiRequest } from "../../lib/api";

function AccountForm({ user, onSaved }) {
  const [form, setForm] = useState({ username: user.username, email: user.email });
  const [status, setStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const isUnchanged =
    form.username.trim() === user.username && form.email.trim().toLowerCase() === user.email;

  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const { ok, data } = await apiRequest("PATCH", "/api/user/profile", form);
    setIsSaving(false);

    if (!ok) {
      setStatus({ type: "danger", message: data.message || "Erro ao salvar os dados" });
      return;
    }
    setForm({ username: data.user.username, email: data.user.email });
    setStatus({ type: "success", message: "Dados atualizados." });
    onSaved(data.user);
  };

  return (
    <section className="soft-card" aria-labelledby="account-title">
      <h3 id="account-title" className="card-heading">
        Dados da conta
      </h3>
      <p className="card-subtitle">Seu nome aparece no sistema; o e-mail é usado para entrar.</p>

      <form onSubmit={handleSubmit}>
        {status && (
          <div className={`alert alert-${status.type}`} role={status.type === "danger" ? "alert" : "status"}>
            {status.message}
          </div>
        )}
        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="accountUsername" className="form-label">
              Nome
            </label>
            <input
              id="accountUsername"
              className="form-control"
              value={form.username}
              onChange={update("username")}
              maxLength={200}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="accountEmail" className="form-label">
              Email
            </label>
            <input
              id="accountEmail"
              type="email"
              className="form-control"
              value={form.email}
              onChange={update("email")}
              maxLength={200}
              required
            />
          </div>
        </div>
        <div className="d-flex justify-content-end mt-3">
          <button type="submit" className="btn btn-primary px-4" disabled={isSaving || isUnchanged}>
            {isSaving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AccountForm;
