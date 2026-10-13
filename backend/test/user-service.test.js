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

  // O tempo de resposta só é igual ao de um e-mail cadastrado se o login fizer
  // um bcrypt.compare contra um hash de mesmo custo. Remover essa comparação
  // (ex.: retornar cedo quando o usuário não existe) tem que quebrar este teste.
  it("faz um bcrypt.compare contra hash de mesmo custo, sem gerar hash", async (t) => {
    const realHashRounds = bcrypt.getRounds(await userService.hashPassword("qualquer"));
    t.mock.method(bcrypt, "hash", () => Promise.reject(new Error("não deveria ser chamado")));
    const compare = t.mock.method(bcrypt, "compare");

    await assert.rejects(
      userService.authenticate({ email: "ninguem@example.com", password: "qualquer-senha" }),
      AuthenticationError
    );

    assert.equal(bcrypt.hash.mock.callCount(), 0);
    assert.equal(compare.mock.callCount(), 1);
    const [password, comparedHash] = compare.mock.calls[0].arguments;
    assert.equal(password, "qualquer-senha");
    assert.equal(bcrypt.getRounds(comparedHash), realHashRounds);
  });
});
