import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import UserFormModal from "../components/UserFormModal";

const PAGE_SIZE = 20;
const ROLE_LABELS = { admin: "Administrador", user: "Usuário" };

async function fetchUsersPage(offset) {
  const { ok, data } = await api.users.list({ limit: PAGE_SIZE, offset });
  if (!ok) throw new Error(data.message || "Erro ao buscar usuários");
  return { users: data.users, total: data.total, offset };
}

function HomeAdmin() {
  const { user: currentUser, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);

  // Só a resposta da requisição mais recente é aplicada: uma página pedida
  // antes não pode sobrescrever outra pedida depois, nem chegar com o
  // componente já fora da tela.
  const latestRequest = useRef(0);

  const loadUsers = useCallback((nextOffset) => {
    const request = ++latestRequest.current;
    const isLatest = () => request === latestRequest.current;
    return fetchUsersPage(nextOffset)
      .then((page) => {
        if (!isLatest()) return;
        setUsers(page.users);
        setTotal(page.total);
        setOffset(page.offset);
        setError("");
      })
      .catch((err) => {
        if (isLatest()) setError(err.message || "Erro ao buscar usuários");
      })
      .finally(() => {
        if (isLatest()) setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    loadUsers(0);
    return () => {
      latestRequest.current += 1;
    };
  }, [loadUsers]);

  const closeModal = () => setModal(null);

  const saveUser = async (values) => {
    const isEdit = modal.type === "edit";
    const { ok, data } = isEdit
      ? await api.users.update(modal.user.id, values)
      : await api.users.create(values);
    if (!ok) return data.message || "Erro ao salvar usuário";

    closeModal();
    loadUsers(offset);
    return null;
  };

  const deleteUser = async () => {
    const { ok, data } = await api.users.remove(modal.user.id);
    closeModal();
    if (!ok) {
      setError(data.message || "Erro ao excluir usuário");
      return;
    }
    const isLastOnPage = users.length === 1 && offset > 0;
    loadUsers(isLastOnPage ? offset - PAGE_SIZE : offset);
  };

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

  const lastShown = Math.min(offset + users.length, total);

  return (
    <div className="content-container">
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h1 className="mb-0">Bem-vindo, {currentUser?.username || currentUser?.email}!</h1>
          <Link to="/home" className="btn btn-outline-secondary btn-sm">
            Minha conta
          </Link>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
          <h2 className="mb-0">Usuários</h2>
          <button
            type="button"
            className="btn btn-success"
            onClick={() => setModal({ type: "create" })}
          >
            Novo Usuário
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuário</th>
              <th>Email</th>
              <th>Perfil</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.id === currentUser?.id;
              return (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{ROLE_LABELS[user.role] || user.role}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary me-1"
                      onClick={() => setModal({ type: "edit", user })}
                    >
                      Editar
                    </button>
                    {!isSelf && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => setModal({ type: "delete", user })}
                      >
                        Excluir
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {total > PAGE_SIZE && (
          <nav
            className="d-flex justify-content-between align-items-center mb-3"
            aria-label="Paginação"
          >
            <button
              type="button"
              className="btn btn-outline-secondary"
              disabled={offset === 0}
              onClick={() => loadUsers(Math.max(offset - PAGE_SIZE, 0))}
            >
              Anterior
            </button>
            <span>
              {offset + 1}–{lastShown} de {total}
            </span>
            <button
              type="button"
              className="btn btn-outline-secondary"
              disabled={lastShown >= total}
              onClick={() => loadUsers(offset + PAGE_SIZE)}
            >
              Próxima
            </button>
          </nav>
        )}

        <button type="button" className="btn btn-primary" onClick={logout}>
          Sair
        </button>
      </div>

      {(modal?.type === "create" || modal?.type === "edit") && (
        <UserFormModal
          user={modal.user}
          isSelf={modal.user?.id === currentUser?.id}
          onSubmit={saveUser}
          onClose={closeModal}
        />
      )}

      {modal?.type === "delete" && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Excluir Usuário</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Fechar"
                  onClick={closeModal}
                />
              </div>
              <div className="modal-body">
                <p>
                  Tem certeza que deseja excluir o usuário <strong>{modal.user.username}</strong>?
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-danger" onClick={deleteUser}>
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeAdmin;
