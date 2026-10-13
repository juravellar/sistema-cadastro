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

function sessionCookie(res) {
  return (res.headers["set-cookie"] || []).find((c) => c.startsWith("connect.sid="));
}

describe("auth", () => {
  let app;

  before(setupDatabase);
  beforeEach(async () => {
    await resetUsers();
    app = buildApp();
  });
  after(closeDatabase);

  describe("POST /api/auth/signup", () => {
    it("cria usuário comum e abre sessão", async () => {
      const agent = request.agent(app);
      const res = await agent
        .post("/api/auth/signup")
        .send({ username: "maria", email: "maria@example.com", password: PASSWORD });

      assert.equal(res.status, 201);
      assert.equal(res.body.user.role, "user");
      assert.equal(res.body.user.password, undefined);
      assert.equal(res.body.redirectTo, "/home");

      const profile = await agent.get("/api/me");
      assert.equal(profile.status, 200);
      assert.equal(profile.body.user.email, "maria@example.com");
    });

    it("não concede admin a e-mails contendo @admin", async () => {
      const agent = request.agent(app);
      const res = await agent
        .post("/api/auth/signup")
        .send({ username: "x", email: "x@admin.evil.com", password: PASSWORD });

      assert.equal(res.status, 201);
      assert.equal(res.body.user.role, "user");
      assert.equal(res.body.redirectTo, "/home");

      const users = await agent.get("/api/users");
      assert.equal(users.status, 403);
    });

    it("ignora role enviado no corpo", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({ username: "y", email: "y@example.com", password: PASSWORD, role: "admin" });

      assert.equal(res.status, 201);
      assert.equal(res.body.user.role, "user");
    });

    for (const [caso, body] of [
      ["sem senha", { username: "a", email: "a@example.com" }],
      ["senha curta", { username: "a", email: "a@example.com", password: "1234567" }],
      [
        "senha acima de 72 bytes",
        { username: "a", email: "a@example.com", password: "x".repeat(73) },
      ],
      ["email inválido", { username: "a", email: "nao-e-email", password: PASSWORD }],
      ["sem username", { email: "a@example.com", password: PASSWORD }],
      ["username longo", { username: "u".repeat(201), email: "a@example.com", password: PASSWORD }],
    ]) {
      it(`retorna 400 com ${caso}`, async () => {
        const res = await request(app).post("/api/auth/signup").send(body);
        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
      });
    }

    it("aceita e-mail com espaços nas pontas e guarda normalizado", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({ username: "ana", email: "  Ana@Example.com ", password: PASSWORD });
      assert.equal(res.status, 201);
      assert.equal(res.body.user.email, "ana@example.com");
    });

    it("recusa e-mail que o model recusaria, com 400 em vez de 500", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({ username: "x", email: "user@x.c", password: PASSWORD });
      assert.equal(res.status, 400);
    });

    it("cadastros simultâneos com o mesmo e-mail: um cria, o outro recebe 409", async () => {
      const body = { username: "x", email: "corrida@example.com", password: PASSWORD };
      const results = await Promise.all([
        request(app).post("/api/auth/signup").send(body),
        request(app).post("/api/auth/signup").send(body),
      ]);
      assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
    });

    it("retorna 409 para e-mail duplicado, mesmo com outra caixa", async () => {
      await createUser({ email: "dup@example.com" });
      const res = await request(app)
        .post("/api/auth/signup")
        .send({ username: "d", email: "DUP@Example.com", password: PASSWORD });
      assert.equal(res.status, 409);
    });
  });

  describe("POST /api/auth/login", () => {
    it("autentica e redireciona admin para /home-admin", async () => {
      await createUser({ email: "boss@example.com", role: "admin" });
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "boss@example.com", password: PASSWORD });

      assert.equal(res.status, 200);
      assert.equal(res.body.user.role, "admin");
      assert.equal(res.body.redirectTo, "/home-admin");
      assert.ok(sessionCookie(res));
    });

    it("não diferencia e-mail inexistente de senha errada", async () => {
      await createUser({ email: "real@example.com" });

      const wrongPassword = await request(app)
        .post("/api/auth/login")
        .send({ email: "real@example.com", password: "senha-errada-123" });
      const unknownEmail = await request(app)
        .post("/api/auth/login")
        .send({ email: "ghost@example.com", password: "senha-errada-123" });

      assert.equal(wrongPassword.status, 401);
      assert.equal(unknownEmail.status, 401);
      assert.deepEqual(wrongPassword.body, unknownEmail.body);
    });

    it("ignora maiúsculas e espaços no e-mail", async () => {
      await createUser({ email: "Mixed@Example.com" });
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "  MIXED@example.COM ", password: PASSWORD });
      assert.equal(res.status, 200);
      assert.equal(res.body.user.email, "mixed@example.com");
    });

    it("retorna 400 sem credenciais", async () => {
      const res = await request(app).post("/api/auth/login").send({});
      assert.equal(res.status, 400);
    });

    it("regenera o ID da sessão a cada login", async () => {
      await createUser({ email: "fix@example.com" });
      const agent = request.agent(app);

      const first = await agent
        .post("/api/auth/login")
        .send({ email: "fix@example.com", password: PASSWORD });
      const second = await agent
        .post("/api/auth/login")
        .send({ email: "fix@example.com", password: PASSWORD });

      assert.ok(sessionCookie(first));
      assert.ok(sessionCookie(second));
      assert.notEqual(sessionCookie(first).split(";")[0], sessionCookie(second).split(";")[0]);
    });

    it("aplica rate limit", async () => {
      const limitedApp = buildApp({ authRateLimit: 2 });
      const attempt = () =>
        request(limitedApp)
          .post("/api/auth/login")
          .send({ email: "a@example.com", password: "qualquer-1" });

      assert.equal((await attempt()).status, 401);
      assert.equal((await attempt()).status, 401);
      assert.equal((await attempt()).status, 429);
    });
  });

  describe("sessão", () => {
    it("perfil exige autenticação", async () => {
      const res = await request(app).get("/api/me");
      assert.equal(res.status, 401);
      assert.match(res.headers["content-type"], /application\/json/);
    });

    it("logout encerra a sessão", async () => {
      await createUser({ email: "out@example.com" });
      const agent = await loginAgent(app, "out@example.com");

      assert.equal((await agent.post("/api/auth/logout")).status, 200);
      assert.equal((await agent.get("/api/me")).status, 401);
    });
  });

  it("rotas anteriores à padronização REST pedem para recarregar a página", async () => {
    for (const [method, path] of [
      ["post", "/api/login"],
      ["post", "/api/signup"],
      ["post", "/api/logout"],
      ["get", "/api/user/profile"],
      ["put", "/api/user/password"],
      ["get", "/api/user/id/1"],
    ]) {
      const res = await request(app)[method](path);
      assert.equal(res.status, 410, `${method.toUpperCase()} ${path}`);
      assert.match(res.body.message, /Recarregue a página/);
    }
  });

  it("rota desconhecida retorna 404 JSON", async () => {
    const res = await request(app).get("/api/nao-existe");
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});
