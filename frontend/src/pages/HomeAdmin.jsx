import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function HomeAdmin() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserInfo();
    fetchUsers();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Erro ao buscar informações do usuário:", error);
      navigate("/");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.users)) {
          setUsers(data.users);
        }
      } else {
        alert("Erro ao buscar usuários");
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      alert("Erro ao buscar usuários do banco de dados");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        navigate("/");
      } else {
        alert("Erro ao fazer logout");
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      alert("Erro ao fazer logout");
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (user) => {
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setEditingUser(null);
    setDeletingUser(null);
    setFormData({ username: "", email: "", password: "" });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        username: formData.username,
        email: formData.email,
      };
      if (formData.password) {
        body.password = formData.password;
      }

      const response = await fetch(`/api/user/id/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      if (response.ok) {
        closeModals();
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.message || "Erro ao editar usuário");
      }
    } catch (error) {
      console.error("Erro ao editar usuário:", error);
      alert("Erro ao editar usuário");
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/user/id/${deletingUser.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        closeModals();
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.message || "Erro ao excluir usuário");
      }
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      alert("Erro ao excluir usuário");
    }
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

  return (
    <div className="content-container">
      <div className="container mt-4">
        <h1>Bem-vindo, {user?.username || user?.email}!</h1>

        <h2>Usuários</h2>
        <button
          type="button"
          className="btn btn-success mb-3"
          onClick={() => navigate("/")}
        >
          Novo Usuário
        </button>

        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuário</th>
              <th>Email</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary me-1"
                    onClick={() => openEditModal(user)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => openDeleteModal(user)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>
      </div>

      {/* Modal de Edição */}
      {isModalOpen && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <form onSubmit={handleEditSubmit} className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Usuário</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModals}
                ></button>
              </div>
              <div className="modal-body">
                <input type="hidden" value={editingUser?.id} />
                <div className="mb-3">
                  <label htmlFor="editUsername" className="form-label">
                    Usuário
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="editUsername"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="editEmail" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="editEmail"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="editPassword" className="form-label">
                    Nova Senha (opcional)
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="editPassword"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModals}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      {isDeleteModalOpen && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <form onSubmit={handleDeleteSubmit} className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Excluir Usuário</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModals}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Tem certeza que deseja excluir o usuário{" "}
                  <strong>{deletingUser?.username}</strong>?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModals}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-danger">
                  Excluir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeAdmin;
