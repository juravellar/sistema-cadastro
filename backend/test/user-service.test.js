const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcrypt");
const { setupDatabase, resetUsers, closeDatabase } = require("./helpers");
const { AuthenticationError } = require("../lib/errors");
const userService = require("../services/user-service");

describe("user-service: login com e-mail inexistente", () => {
  before(async () => {
    await setupDatabase();
    await resetUsers();
  });
  after(closeDatabase);

  it("não gera hash em tempo de execução, então não tem como falhar nem variar o tempo", async (t) => {
    t.mock.method(bcrypt, "hash", () => Promise.reject(new Error("não deveria ser chamado")));

    await assert.rejects(
      userService.authenticate({ email: "ninguem@example.com", password: "qualquer-senha" }),
      AuthenticationError
    );
    assert.equal(bcrypt.hash.mock.callCount(), 0);
  });

  it("compara contra um hash com o mesmo custo dos hashes reais", () => {
    assert.equal(bcrypt.getRounds(userService.DUMMY_PASSWORD_HASH), userService.BCRYPT_ROUNDS);
  });
});
