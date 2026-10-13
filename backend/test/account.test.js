const { describe, it, before, beforeEach, after } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const {
  PASSWORD,
  setupDatabase,
  resetUsers,
  buildApp,
  createUser,
  loginAgent,
  closeDatabase,
} = require("./helpers");

const NEW_PASSWORD = "nova-senha-segura-456";

describe("conta do próprio usuário", () => {
  let app;
  let agent;

  before(setupDatabase);
  beforeEach(async () => {
    await resetUsers();
    app = buildApp();
    await createUser({ email: "maria@example.com", username: "maria" });
    agent = await loginAgent(app, "maria@example.com");
  });
  after(closeDatabase);

  describe("GET /api/user/profile", () => {
    it("inclui a data de cadastro", async () => {
      const res = await agent.get("/api/user/profile");
      assert.equal(res.status, 200);
      assert.ok(!Number.isNaN(Date.parse(res.body.user.createdAt)));
    });
  });

  describe("PATCH /api/user/profile", () => {
    it("atualiza nome e e-mail normalizado", async () => {
      const res = await agent
        .patch("/api/user/profile")
        .send({ username: "  Maria Silva ", email: "Maria.Silva@Example.com" });

      assert.equal(res.status, 200);
      assert.equal(res.body.user.username, "Maria Silva");
      assert.equal(res.body.user.email, "maria.silva@example.com");
      assert.equal((await agent.get("/api/user/profile")).body.user.username, "Maria Silva");
    });

    it("não permite mudar o próprio perfil por aqui", async () => {
      const res = await agent.patch("/api/user/profile").send({ role: "admin" });
      assert.equal(res.status, 200);
      assert.equal(res.body.user.role, "user");
    });

    it("retorna 409 para e-mail de outra pessoa", async () => {
      await createUser({ email: "joana@example.com" });
      const res = await agent.patch("/api/user/profile").send({ email: "JOANA@example.com" });
      assert.equal(res.status, 409);
    });

    it("valida os campos", async () => {
      assert.equal((await agent.patch("/api/user/profile").send({ username: "" })).status, 400);
      assert.equal((await agent.patch("/api/user/profile").send({ email: "invalido" })).status, 400);
    });

    it("exige login", async () => {
      const res = await request(app).patch("/api/user/profile").send({ username: "x" });
      assert.equal(res.status, 401);
    });
  });

  describe("PUT /api/user/password", () => {
    it("troca a senha e mantém a sessão atual", async () => {
      const res = await agent
        .put("/api/user/password")
        .send({ currentPassword: PASSWORD, newPassword: NEW_PASSWORD });

      assert.equal(res.status, 200);
      assert.equal((await agent.get("/api/user/profile")).status, 200);

      const oldLogin = await request(app)
        .post("/api/login")
        .send({ email: "maria@example.com", password: PASSWORD });
      const newLogin = await request(app)
        .post("/api/login")
        .send({ email: "maria@example.com", password: NEW_PASSWORD });
      assert.equal(oldLogin.status, 401);
      assert.equal(newLogin.status, 200);
    });

    it("encerra as outras sessões abertas", async () => {
      const otherDevice = await loginAgent(app, "maria@example.com");
      assert.equal((await otherDevice.get("/api/user/profile")).status, 200);

      await agent
        .put("/api/user/password")
        .send({ currentPassword: PASSWORD, newPassword: NEW_PASSWORD });

      assert.equal((await otherDevice.get("/api/user/profile")).status, 401);
    });

    it("recusa senha atual incorreta sem alterar nada", async () => {
      const res = await agent
        .put("/api/user/password")
        .send({ currentPassword: "senha-errada-000", newPassword: NEW_PASSWORD });

      assert.equal(res.status, 400);
      assert.equal((await agent.get("/api/user/profile")).status, 200);
      const login = await request(app)
        .post("/api/login")
        .send({ email: "maria@example.com", password: PASSWORD });
      assert.equal(login.status, 200);
    });

    it("valida a nova senha", async () => {
      const res = await agent
        .put("/api/user/password")
        .send({ currentPassword: PASSWORD, newPassword: "curta" });
      assert.equal(res.status, 400);
    });

    it("aplica rate limit", async () => {
      const limitedApp = buildApp({ authRateLimit: 3 });
      const limitedAgent = await loginAgent(limitedApp, "maria@example.com");
      const attempt = () =>
        limitedAgent
          .put("/api/user/password")
          .send({ currentPassword: "senha-errada-000", newPassword: NEW_PASSWORD });

      assert.equal((await attempt()).status, 400);
      assert.equal((await attempt()).status, 400);
      assert.equal((await attempt()).status, 429);
    });
  });

  it("senha redefinida pelo admin encerra as sessões do usuário", async () => {
    const maria = (await agent.get("/api/user/profile")).body.user;
    await createUser({ email: "admin@example.com", role: "admin" });
    const admin = await loginAgent(app, "admin@example.com");

    await admin.put(`/api/user/id/${maria.id}`).send({ password: NEW_PASSWORD });

    assert.equal((await agent.get("/api/user/profile")).status, 401);
  });
});
