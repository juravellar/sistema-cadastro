const { describe, it, before, beforeEach, after } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const {
  setupDatabase,
  resetUsers,
  buildApp,
  createUser,
  loginAgent,
  closeDatabase,
} = require("./helpers");

describe("users (admin)", () => {
  let app;
  let admin;
  let adminAgent;

  before(setupDatabase);
  beforeEach(async () => {
    await resetUsers();
    app = buildApp();
    admin = await createUser({ email: "admin@example.com", role: "admin", username: "admin" });
    adminAgent = await loginAgent(app, "admin@example.com");
  });
  after(closeDatabase);

  it("exige autenticação (401) e papel admin (403)", async () => {
    assert.equal((await request(app).get("/api/users")).status, 401);

    await createUser({ email: "comum@example.com" });
    const userAgent = await loginAgent(app, "comum@example.com");
    assert.equal((await userAgent.get("/api/users")).status, 403);
    assert.equal((await userAgent.delete(`/api/user/id/${admin.id}`)).status, 403);
  });

  it("lista usuários paginados sem expor senha", async () => {
    for (let i = 0; i < 3; i++) await createUser({ email: `u${i}@example.com` });

    const res = await adminAgent.get("/api/users?limit=2&offset=1");

    assert.equal(res.status, 200);
    assert.equal(res.body.total, 4);
    assert.equal(res.body.users.length, 2);
    assert.equal(res.body.users[0].email, "u0@example.com");
    assert.ok(res.body.users.every((u) => u.password === undefined));
  });

  it("limita o tamanho da página", async () => {
    const res = await adminAgent.get("/api/users?limit=10000");
    assert.equal(res.body.limit, 100);
  });

  it("valida o id", async () => {
    assert.equal((await adminAgent.get("/api/user/id/abc")).status, 400);
    assert.equal((await adminAgent.get("/api/user/id/1e3")).status, 400);
    assert.equal((await adminAgent.get("/api/user/id/9999")).status, 404);
  });

  describe("POST /api/users", () => {
    it("cria usuário com o perfil informado", async () => {
      const res = await adminAgent
        .post("/api/users")
        .send({ username: "nova", email: "Nova@Example.com", password: "senha-segura-123", role: "admin" });

      assert.equal(res.status, 201);
      assert.deepEqual(
        { email: res.body.user.email, role: res.body.user.role },
        { email: "nova@example.com", role: "admin" }
      );
      assert.equal(res.body.user.password, undefined);
    });

    it("usa perfil user por padrão e não troca a sessão do admin", async () => {
      const res = await adminAgent
        .post("/api/users")
        .send({ username: "nova", email: "nova@example.com", password: "senha-segura-123" });

      assert.equal(res.body.user.role, "user");
      assert.equal((await adminAgent.get("/api/user/profile")).body.user.email, "admin@example.com");
    });

    it("retorna 409 para e-mail existente com outra caixa", async () => {
      const res = await adminAgent
        .post("/api/users")
        .send({ username: "x", email: "ADMIN@example.com", password: "senha-segura-123" });
      assert.equal(res.status, 409);
    });

    it("valida os campos", async () => {
      const send = (body) => adminAgent.post("/api/users").send(body);
      const base = { username: "x", email: "x@example.com", password: "senha-segura-123" };

      assert.equal((await send({ ...base, role: "root" })).status, 400);
      assert.equal((await send({ ...base, password: "curta" })).status, 400);
      assert.equal((await send({ ...base, email: "invalido" })).status, 400);
    });

    it("exige admin", async () => {
      await createUser({ email: "comum@example.com" });
      const userAgent = await loginAgent(app, "comum@example.com");
      const res = await userAgent
        .post("/api/users")
        .send({ username: "x", email: "x@example.com", password: "senha-segura-123", role: "admin" });
      assert.equal(res.status, 403);
    });
  });

  describe("PUT /api/user/id/:id", () => {
    it("atualiza campos e promove outro usuário", async () => {
      const target = await createUser({ email: "alvo@example.com" });

      const res = await adminAgent
        .put(`/api/user/id/${target.id}`)
        .send({ username: "novo", role: "admin" });

      assert.equal(res.status, 200);
      assert.equal(res.body.user.username, "novo");
      assert.equal(res.body.user.role, "admin");
    });

    it("impede o admin de alterar o próprio perfil", async () => {
      const res = await adminAgent.put(`/api/user/id/${admin.id}`).send({ role: "user" });
      assert.equal(res.status, 400);
    });

    it("rejeita perfil inválido", async () => {
      const target = await createUser({ email: "alvo@example.com" });
      const res = await adminAgent.put(`/api/user/id/${target.id}`).send({ role: "root" });
      assert.equal(res.status, 400);
    });

    it("rebaixamento tira o acesso imediatamente, sem esperar a sessão expirar", async () => {
      await createUser({ email: "outro-admin@example.com", role: "admin" });
      const otherAgent = await loginAgent(app, "outro-admin@example.com");
      assert.equal((await otherAgent.get("/api/users")).status, 200);

      const other = (await adminAgent.get("/api/users")).body.users.find(
        (u) => u.email === "outro-admin@example.com"
      );
      await adminAgent.put(`/api/user/id/${other.id}`).send({ role: "user" });

      assert.equal((await otherAgent.get("/api/users")).status, 403);
      assert.equal((await otherAgent.get("/api/user/profile")).body.user.role, "user");
    });

    it("aceita alterar só a caixa do próprio e-mail", async () => {
      const target = await createUser({ email: "alvo@example.com" });
      const res = await adminAgent.put(`/api/user/id/${target.id}`).send({ email: "ALVO@example.com" });
      assert.equal(res.status, 200);
      assert.equal(res.body.user.email, "alvo@example.com");
    });

    it("retorna 409 para e-mail de outro usuário", async () => {
      const target = await createUser({ email: "alvo@example.com" });
      const res = await adminAgent
        .put(`/api/user/id/${target.id}`)
        .send({ email: "admin@example.com" });
      assert.equal(res.status, 409);
    });

    it("retorna 400 para senha inválida", async () => {
      const target = await createUser({ email: "alvo@example.com" });
      const res = await adminAgent.put(`/api/user/id/${target.id}`).send({ password: "curta" });
      assert.equal(res.status, 400);
    });
  });

  describe("DELETE /api/user/id/:id", () => {
    it("exclui outro usuário", async () => {
      const target = await createUser({ email: "alvo@example.com" });

      const res = await adminAgent.delete(`/api/user/id/${target.id}`);

      assert.equal(res.status, 200);
      assert.equal((await adminAgent.get(`/api/user/id/${target.id}`)).status, 404);
    });

    it("encerra a sessão de quem foi excluído", async () => {
      const target = await createUser({ email: "alvo@example.com" });
      const targetAgent = await loginAgent(app, "alvo@example.com");

      await adminAgent.delete(`/api/user/id/${target.id}`);

      assert.equal((await targetAgent.get("/api/user/profile")).status, 401);
    });

    it("impede o admin de excluir a própria conta", async () => {
      const res = await adminAgent.delete(`/api/user/id/${admin.id}`);
      assert.equal(res.status, 400);
    });
  });
});
