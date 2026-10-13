const { describe, it, before, after, mock } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcrypt");
const { setupDatabase, resetUsers, closeDatabase } = require("./helpers");
const { AuthenticationError } = require("../lib/errors");
const userService = require("../services/user-service");

describe("user-service: hash de comparação do login", () => {
  before(async () => {
    await setupDatabase();
    await resetUsers();
  });
  after(closeDatabase);

  it("se a geração falhar uma vez, o login de e-mail inexistente ainda responde 401", async () => {
    const realHash = bcrypt.hash;
    let calls = 0;
    mock.method(bcrypt, "hash", (...args) => {
      calls += 1;
      return calls === 1 ? Promise.reject(new Error("falha transitória")) : realHash(...args);
    });

    await assert.rejects(
      userService.authenticate({ email: "ninguem@example.com", password: "qualquer-senha" }),
      AuthenticationError
    );
    await assert.rejects(
      userService.authenticate({ email: "ninguem@example.com", password: "qualquer-senha" }),
      AuthenticationError
    );
    mock.restoreAll();
  });
});
