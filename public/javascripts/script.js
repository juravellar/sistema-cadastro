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
