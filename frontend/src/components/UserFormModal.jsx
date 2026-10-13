import { useState } from "react";
import { Link } from "react-router-dom";

const EMPTY_FORM = { username: "", email: "", password: "", role: "user" };

function UserFormModal({ user, isSelf = false, onSubmit, onClose }) {
  const isEdit = Boolean(user);
  const [form, setForm] = useState(
    isEdit
      ? { username: user.username, email: user.email, password: "", role: user.role }
      : EMPTY_FORM
  );
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    const values = { username: form.username, email: form.email };
    if (form.password) values.password = form.password;
    if (!isSelf) values.role = form.role;

    const message = await onSubmit(values);
    setIsSaving(false);
    if (message) setError(message);
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <form onSubmit={handleSubmit} className="modal-content" aria-label="Formulário de usuário">
          <div className="modal-header">
            <h5 className="modal-title">{isEdit ? "Editar Usuário" : "Novo Usuário"}</h5>
            <button type="button" className="btn-close" aria-label="Fechar" onClick={onClose} />
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <div className="mb-3">
              <label htmlFor="userUsername" className="form-label">
                Usuário
              </label>
              <input
                id="userUsername"
                className="form-control"
                value={form.username}
                onChange={update("username")}
                maxLength={200}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="userEmail" className="form-label">
                Email
              </label>
              <input
                id="userEmail"
                type="email"
                className="form-control"
                value={form.email}
                onChange={update("email")}
                maxLength={200}
                required
              />
            </div>
            {isSelf ? (
              <p className="form-text mb-3">
                Para trocar a sua senha, use a página <Link to="/home">Minha conta</Link>.
              </p>
            ) : (
              <div className="mb-3">
                <label htmlFor="userPassword" className="form-label">
                  {isEdit ? "Nova senha (opcional)" : "Senha"}
                </label>
                <input
                  id="userPassword"
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={update("password")}
                  minLength={8}
                  required={!isEdit}
                />
              </div>
            )}
            <div className="mb-3">
              <label htmlFor="userRole" className="form-label">
                Perfil
              </label>
              <select
                id="userRole"
                className="form-select"
                value={form.role}
                onChange={update("role")}
                disabled={isSelf}
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
              {isSelf && (
                <div className="form-text">Você não pode alterar o seu próprio perfil.</div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserFormModal;
