import { describe, it, expect } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { mockApi, callsTo, ADMIN, USER } from "../test/mockApi";

function renderAdminPanel(routes = {}) {
  let users = [ADMIN, USER];
  const fetchMock = mockApi({
    sessionUser: ADMIN,
    routes: {
      "GET /api/users": () => [200, { success: true, users, total: users.length }],
      ...routes,
    },
  });
  window.history.pushState({}, "", "/home-admin");
  render(<App />);
  return {
    fetchMock,
    setUsers: (next) => {
      users = next;
    },
  };
}

const rowOf = async (email) => (await screen.findByText(email)).closest("tr");

describe("painel admin", () => {
  it("cria usuário pelo modal sem trocar a sessão do admin", async () => {
    let api;
    api = renderAdminPanel({
      "POST /api/users": (body) => {
        const created = { id: 3, ...body };
        api.setUsers([ADMIN, USER, created]);
        return [201, { success: true, user: created }];
      },
    });

    await userEvent.click(await screen.findByRole("button", { name: "Novo Usuário" }));
    const form = screen.getByRole("form", { name: "Formulário de usuário" });
    await userEvent.type(within(form).getByLabelText("Usuário"), "joana");
    await userEvent.type(within(form).getByLabelText("Email"), "joana@example.com");
    await userEvent.type(within(form).getByLabelText("Senha"), "senha-segura-123");
    await userEvent.selectOptions(within(form).getByLabelText("Perfil"), "admin");
    await userEvent.click(within(form).getByRole("button", { name: "Salvar" }));

    expect(await screen.findByText("joana@example.com")).toBeInTheDocument();
    const [[, options]] = callsTo(api.fetchMock, "POST", "/api/users");
    expect(JSON.parse(options.body)).toEqual({
      username: "joana",
      email: "joana@example.com",
      password: "senha-segura-123",
      role: "admin",
    });
    expect(screen.getByText(`Bem-vindo, ${ADMIN.username}!`)).toBeInTheDocument();
  });

  it("mostra o erro da API dentro do modal", async () => {
    renderAdminPanel({
      "POST /api/users": () => [409, { success: false, message: "Email já cadastrado" }],
    });

    await userEvent.click(await screen.findByRole("button", { name: "Novo Usuário" }));
    const form = screen.getByRole("form", { name: "Formulário de usuário" });
    await userEvent.type(within(form).getByLabelText("Usuário"), "x");
    await userEvent.type(within(form).getByLabelText("Email"), "maria@example.com");
    await userEvent.type(within(form).getByLabelText("Senha"), "senha-segura-123");
    await userEvent.click(within(form).getByRole("button", { name: "Salvar" }));

    expect(await within(form).findByRole("alert")).toHaveTextContent("Email já cadastrado");
  });

  it("não oferece excluir nem mudar o perfil da própria conta", async () => {
    renderAdminPanel();

    const ownRow = await rowOf(ADMIN.email);
    expect(within(ownRow).queryByRole("button", { name: "Excluir" })).not.toBeInTheDocument();
    expect(within(await rowOf(USER.email)).getByRole("button", { name: "Excluir" })).toBeInTheDocument();

    await userEvent.click(within(ownRow).getByRole("button", { name: "Editar" }));
    expect(screen.getByLabelText("Perfil")).toBeDisabled();
  });

  it("promove outro usuário enviando o novo perfil", async () => {
    const { fetchMock } = renderAdminPanel({
      "PUT /api/user/id/2": (body) => [200, { success: true, user: { ...USER, ...body } }],
    });

    await userEvent.click(within(await rowOf(USER.email)).getByRole("button", { name: "Editar" }));
    await userEvent.selectOptions(screen.getByLabelText("Perfil"), "admin");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await screen.findByRole("heading", { name: "Usuários" });
    const [[, options]] = callsTo(fetchMock, "PUT", "/api/user/id/2");
    expect(JSON.parse(options.body)).toEqual({
      username: USER.username,
      email: USER.email,
      role: "admin",
    });
  });

  it("sessão encerrada no servidor leva ao login com aviso", async () => {
    let api;
    api = renderAdminPanel({
      "POST /api/users": () => [401, { success: false, message: "Usuário não autenticado" }],
    });
    await screen.findByRole("heading", { name: "Usuários" });
    api.fetchMock.setSessionUser(null);

    await userEvent.click(screen.getByRole("button", { name: "Novo Usuário" }));
    const form = screen.getByRole("form", { name: "Formulário de usuário" });
    await userEvent.type(within(form).getByLabelText("Usuário"), "x");
    await userEvent.type(within(form).getByLabelText("Email"), "x@example.com");
    await userEvent.type(within(form).getByLabelText("Senha"), "senha-segura-123");
    await userEvent.click(within(form).getByRole("button", { name: "Salvar" }));

    expect(await screen.findByText("Sua sessão foi encerrada. Entre novamente.")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/");
  });

  it("admin rebaixado durante o uso vai para a home", async () => {
    let api;
    api = renderAdminPanel({
      "PUT /api/user/id/2": () => [403, { success: false, message: "Apenas administradores" }],
    });
    await screen.findByRole("heading", { name: "Usuários" });
    api.fetchMock.setSessionUser({ ...ADMIN, role: "user" });

    await userEvent.click(within(await rowOf(USER.email)).getByRole("button", { name: "Editar" }));
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => expect(window.location.pathname).toBe("/home"));
  });

  it("editar a própria conta não oferece troca de senha e aponta para Minha conta", async () => {
    renderAdminPanel();

    await userEvent.click(within(await rowOf(ADMIN.email)).getByRole("button", { name: "Editar" }));

    const form = screen.getByRole("form", { name: "Formulário de usuário" });
    expect(within(form).queryByLabelText(/senha/i)).not.toBeInTheDocument();
    expect(within(form).getByRole("link", { name: "Minha conta" })).toHaveAttribute("href", "/home");
  });

  it("leva à página Minha conta pelo cabeçalho", async () => {
    renderAdminPanel();

    await userEvent.click(await screen.findByRole("link", { name: "Minha conta" }));

    expect(await screen.findByRole("region", { name: "Alterar senha" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/home");
  });
});

