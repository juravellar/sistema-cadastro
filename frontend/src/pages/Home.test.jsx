import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { mockApi, callsTo, USER, ADMIN } from "../test/mockApi";

function renderHome(routes = {}) {
  const fetchMock = mockApi({ sessionUser: USER, routes });
  window.history.pushState({}, "", "/home");
  render(<App />);
  return fetchMock;
}

const accountSection = () => screen.getByRole("region", { name: "Dados da conta" });
const passwordSection = () => screen.getByRole("region", { name: "Alterar senha" });

async function fillPassword({ current, next, confirm }) {
  const section = passwordSection();
  await userEvent.type(within(section).getByLabelText("Senha atual"), current);
  await userEvent.type(within(section).getByLabelText("Nova senha"), next);
  await userEvent.type(within(section).getByLabelText("Confirmar nova senha"), confirm);
  await userEvent.click(within(section).getByRole("button", { name: "Alterar senha" }));
}

describe("home do usuário", () => {
  it("mostra o perfil com nome, e-mail, perfil e data de cadastro", async () => {
    renderHome();

    const profile = await screen.findByRole("region", { name: "Seu perfil" });
    expect(within(profile).getByText(USER.username)).toBeInTheDocument();
    expect(within(profile).getByText(USER.email)).toBeInTheDocument();
    expect(within(profile).getByText("Usuário")).toBeInTheDocument();
    expect(within(profile).getByText("9 de outubro de 2026")).toBeInTheDocument();
  });

  it("só habilita salvar quando algo muda", async () => {
    renderHome();
    await screen.findByRole("region", { name: "Dados da conta" });

    const save = within(accountSection()).getByRole("button", { name: "Salvar alterações" });
    expect(save).toBeDisabled();

    await userEvent.type(within(accountSection()).getByLabelText("Nome"), " Silva");
    expect(save).toBeEnabled();
  });

  it("salva os dados e atualiza cabeçalho e cartão", async () => {
    const fetchMock = renderHome({
      "PATCH /api/me": (body) => [200, { success: true, user: { ...USER, ...body } }],
    });
    await screen.findByRole("region", { name: "Dados da conta" });

    const name = within(accountSection()).getByLabelText("Nome");
    await userEvent.clear(name);
    await userEvent.type(name, "Maria Souza");
    await userEvent.click(
      within(accountSection()).getByRole("button", { name: "Salvar alterações" })
    );

    expect(await within(accountSection()).findByRole("status")).toHaveTextContent(
      "Dados atualizados."
    );
    const [[, options]] = callsTo(fetchMock, "PATCH", "/api/me");
    expect(JSON.parse(options.body)).toEqual({ username: "Maria Souza", email: USER.email });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/, Maria!$/);
    expect(
      within(screen.getByRole("region", { name: "Seu perfil" })).getByText("Maria Souza")
    ).toBeInTheDocument();
  });

  it("mostra o erro da API ao salvar os dados", async () => {
    renderHome({
      "PATCH /api/me": () => [
        409,
        { success: false, message: "Email já cadastrado por outro usuário." },
      ],
    });
    await screen.findByRole("region", { name: "Dados da conta" });

    const email = within(accountSection()).getByLabelText("Email");
    await userEvent.clear(email);
    await userEvent.type(email, "joana@example.com");
    await userEvent.click(
      within(accountSection()).getByRole("button", { name: "Salvar alterações" })
    );

    expect(await within(accountSection()).findByRole("alert")).toHaveTextContent(
      "Email já cadastrado"
    );
  });

  it("não envia a troca de senha se a confirmação não confere", async () => {
    const fetchMock = renderHome();
    await screen.findByRole("region", { name: "Alterar senha" });

    await fillPassword({
      current: "senha-atual-123",
      next: "nova-senha-456",
      confirm: "outra-senha-789",
    });

    expect(within(passwordSection()).getByRole("alert")).toHaveTextContent("não confere");
    expect(callsTo(fetchMock, "PUT", "/api/me/password")).toHaveLength(0);
  });

  it("troca a senha e limpa o formulário", async () => {
    const fetchMock = renderHome({
      "PUT /api/me/password": () => [200, { success: true }],
    });
    await screen.findByRole("region", { name: "Alterar senha" });

    await fillPassword({
      current: "senha-atual-123",
      next: "nova-senha-456",
      confirm: "nova-senha-456",
    });

    expect(await within(passwordSection()).findByRole("status")).toHaveTextContent(
      "Senha alterada"
    );
    const [[, options]] = callsTo(fetchMock, "PUT", "/api/me/password");
    expect(JSON.parse(options.body)).toEqual({
      currentPassword: "senha-atual-123",
      newPassword: "nova-senha-456",
    });
    expect(within(passwordSection()).getByLabelText("Senha atual")).toHaveValue("");
  });

  it("mostra quando a senha atual está errada", async () => {
    renderHome({
      "PUT /api/me/password": () => [400, { success: false, message: "Senha atual incorreta" }],
    });
    await screen.findByRole("region", { name: "Alterar senha" });

    await fillPassword({
      current: "errada-000000",
      next: "nova-senha-456",
      confirm: "nova-senha-456",
    });

    expect(await within(passwordSection()).findByRole("alert")).toHaveTextContent(
      "Senha atual incorreta"
    );
  });

  it("mostra o link do painel só para admin", async () => {
    renderHome();
    await screen.findByRole("region", { name: "Seu perfil" });
    expect(screen.queryByRole("link", { name: "Painel admin" })).not.toBeInTheDocument();
  });

  it("admin volta ao painel pelo cabeçalho", async () => {
    mockApi({
      sessionUser: ADMIN,
      routes: { "GET /api/users": () => [200, { success: true, users: [ADMIN], total: 1 }] },
    });
    window.history.pushState({}, "", "/home");
    render(<App />);

    await userEvent.click(await screen.findByRole("link", { name: "Painel admin" }));

    expect(await screen.findByRole("heading", { name: "Usuários" })).toBeInTheDocument();
  });
});
