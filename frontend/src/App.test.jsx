import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { mockApi, ADMIN, USER } from "./test/mockApi";

function renderAt(path) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

const usersList = () => [200, { success: true, users: [ADMIN, USER], total: 2 }];

describe("guards de rota", () => {
  it("redireciona visitante de página protegida para o login com aviso", async () => {
    mockApi();
    renderAt("/home");

    expect(await screen.findByText("Faça login para acessar esta página.")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/");
  });

  it("manda usuário comum que abre o painel admin para a home", async () => {
    mockApi({ sessionUser: USER });
    renderAt("/home-admin");

    expect(await screen.findByText(`Bem-vindo, ${USER.username}!`)).toBeInTheDocument();
    expect(window.location.pathname).toBe("/home");
  });

  it("leva usuário já logado da tela de login para o painel do seu perfil", async () => {
    mockApi({ sessionUser: ADMIN, routes: { "GET /api/users": usersList } });
    renderAt("/");

    expect(await screen.findByRole("heading", { name: "Usuários" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/home-admin");
  });

  it("logout volta ao login sem aviso de acesso indevido", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    mockApi({ sessionUser: USER });
    renderAt("/home");

    await userEvent.click(await screen.findByRole("button", { name: "Sair" }));

    expect(await screen.findByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/");
    expect(screen.queryByText("Faça login para acessar esta página.")).not.toBeInTheDocument();
    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it("decide o perfil pelo role, não pelo e-mail", async () => {
    mockApi({ sessionUser: { ...USER, email: "x@admin.evil.com" } });
    renderAt("/home-admin");

    expect(await screen.findByText(`Bem-vindo, ${USER.username}!`)).toBeInTheDocument();
    expect(window.location.pathname).toBe("/home");
  });
});
