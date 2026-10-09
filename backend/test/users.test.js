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

  describe("PUT /api/user/id/:id", () => {
    it("atualiza campos e não permite alterar role", async () => {
      const target = await createUser({ email: "alvo@example.com" });

      const res = await adminAgent
        .put(`/api/user/id/${target.id}`)
        .send({ username: "novo", role: "admin" });

      assert.equal(res.status, 200);
      assert.equal(res.body.user.username, "novo");
      assert.equal(res.body.user.role, "user");
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

    it("impede o admin de excluir a própria conta", async () => {
      const res = await adminAgent.delete(`/api/user/id/${admin.id}`);
      assert.equal(res.status, 400);
    });
  });
});
