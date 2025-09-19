(function () {
  "use strict";

  const loginForm = document.getElementById("login-form");
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    event.stopPropagation();

    if (loginForm.checkValidity()) {
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(
          password
        )}`,
      })
        .then((response) => {
          if (response.ok) {
            window.location.href = "/home";
          } else {
            const toast = new bootstrap.Toast(
              document.getElementById("errorToast") ||
                createToast("Credenciais inválidas!", "danger")
            );
            toast.show();
          }
        })
        .catch((error) => {
          console.error("Erro:", error);
          const toast = new bootstrap.Toast(
            document.getElementById("errorToast") ||
              createToast("Erro ao fazer login!", "danger")
          );
          toast.show();
        });
    } else {
      loginForm.classList.add("was-validated");
    }
  });

  const signupForm = document.getElementById("sign-up-form");
  signupForm.addEventListener("submit", function (event) {
    event.preventDefault();
    event.stopPropagation();

    const password = document.getElementById("sign-up-password");
    const confirmPassword = document.getElementById("sign-up-confirm");

    if (password.value !== confirmPassword.value) {
      confirmPassword.setCustomValidity("As senhas não coincidem");
    } else {
      confirmPassword.setCustomValidity("");
    }

    if (signupForm.checkValidity()) {
      const username = document.getElementById("sign-up-username").value;
      const email = document.getElementById("sign-up-email").value;
      const passwordValue = password.value;

      fetch("/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `username=${encodeURIComponent(
          username
        )}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(
          passwordValue
        )}`,
      })
        .then((response) => {
          if (response.ok) {
            window.location.href = "/home";
          } else {
            const toast = new bootstrap.Toast(
              document.getElementById("errorToast") ||
                createToast("Erro ao criar conta!", "danger")
            );
            toast.show();
          }
        })
        .catch((error) => {
          console.error("Erro:", error);
          const toast = new bootstrap.Toast(
            document.getElementById("errorToast") ||
              createToast("Erro ao criar conta!", "danger")
          );
          toast.show();
        });
    } else {
      signupForm.classList.add("was-validated");
    }
  });

  document
    .getElementById("sign-up-confirm")
    .addEventListener("input", function () {
      const password = document.getElementById("sign-up-password");
      const confirmPassword = this;

      if (password.value !== confirmPassword.value) {
        confirmPassword.setCustomValidity("As senhas não coincidem");
      } else {
        confirmPassword.setCustomValidity("");
      }
    });

  document.querySelectorAll('[data-bs-toggle="tab"]').forEach((tab) => {
    tab.addEventListener("shown.bs.tab", function () {
      document.querySelectorAll(".was-validated").forEach((form) => {
        form.classList.remove("was-validated");
      });
    });
  });

  function createToast(message, type) {
    const toastContainer =
      document.getElementById("toastContainer") || createToastContainer();
    const toastId = "toast-" + Date.now();

    const toastHTML = `
                  <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                      <div class="d-flex">
                          <div class="toast-body">
                              ${message}
                          </div>
                          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                      </div>
                  </div>
              `;

    toastContainer.insertAdjacentHTML("beforeend", toastHTML);
    return document.getElementById(toastId);
  }

  function createToastContainer() {
    const container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container position-fixed bottom-0 end-0 p-3";
    document.body.appendChild(container);
    return container;
  }
})();

async function fetchUsers() {
  const res = await fetch('/api/users');
  const data = await res.json();
  const tbody = document.querySelector('#usersTable tbody');
  tbody.innerHTML = '';
  if (data.success && Array.isArray(data.users)) {
    data.users.forEach(user => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${user.id}</td>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>
          <button class="btn btn-sm btn-primary me-1" onclick="openEditUserModal(${user.id}, '${user.username}', '${user.email}')">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="openDeleteUserModal(${user.id}, '${user.username}')">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
}

function openEditUserModal(id, username, email) {
  document.getElementById('editUserId').value = id;
  document.getElementById('editUsername').value = username;
  document.getElementById('editEmail').value = email;
  document.getElementById('editPassword').value = '';
  var editModal = new bootstrap.Modal(document.getElementById('editUserModal'));
  editModal.show();
}

function openDeleteUserModal(id, username) {
  document.getElementById('deleteUserId').value = id;
  document.getElementById('deleteUserName').textContent = username;
  var deleteModal = new bootstrap.Modal(document.getElementById('deleteUserModal'));
  deleteModal.show();
}

document.getElementById('createUserForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const form = e.target;
  const body = {
    username: form.username.value,
    email: form.email.value,
    password: form.password.value
  };
  const res = await fetch('/api/sign-up', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (res.ok) {
    bootstrap.Modal.getInstance(document.getElementById('createUserModal')).hide();
    form.reset();
    fetchUsers();
  } else {
    const data = await res.json();
    alert(data.message || 'Erro ao criar usuário');
  }
});

document.getElementById('editUserForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const form = e.target;
  const id = form.id.value;
  const body = {
    username: form.username.value,
    email: form.email.value,
  };
  if (form.password.value) {
    body.password = form.password.value;
  }
  const res = await fetch(`/api/user/id/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (res.ok) {
    bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
    fetchUsers();
  } else {
    const data = await res.json();
    alert(data.message || 'Erro ao editar usuário');
  }
});

document.getElementById('deleteUserForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const id = document.getElementById('deleteUserId').value;
  const res = await fetch(`/api/user/id/${id}`, {
    method: 'DELETE'
  });
  if (res.ok) {
    bootstrap.Modal.getInstance(document.getElementById('deleteUserModal')).hide();
    fetchUsers();
  } else {
    const data = await res.json();
    alert(data.message || 'Erro ao excluir usuário');
  }
});
