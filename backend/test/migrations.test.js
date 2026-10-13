const { describe, it, before, beforeEach, after } = require("node:test");
const assert = require("node:assert/strict");
const { setupDatabase, resetUsers, closeDatabase } = require("./helpers");
const { sequelize } = require("../models");
const normalizeEmails = require("../db/migrations/004-normalize-emails");

// Inserção via SQL puro para contornar o setter do model e simular dados legados.
function insertRaw(email) {
  return sequelize.query(
    `INSERT INTO users (username, password, email, role, "createdAt", "updatedAt")
     VALUES ('u', 'x', $1, 'user', now(), now())`,
    { bind: [email] }
  );
}

async function emails() {
  const [rows] = await sequelize.query("SELECT email FROM users ORDER BY id");
  return rows.map((r) => r.email);
}

describe("migration 004-normalize-emails", () => {
  const context = sequelize.getQueryInterface();

  before(setupDatabase);
  beforeEach(resetUsers);
  after(closeDatabase);

  it("normaliza e-mails legados para minúsculas sem espaços", async () => {
    await insertRaw("Ana@Example.com");
    await insertRaw(" bia@example.com ");

    await normalizeEmails.up({ context });

    assert.deepEqual(await emails(), ["ana@example.com", "bia@example.com"]);
  });

  it("aborta sem alterar nada quando há duplicatas por caixa", async () => {
    await insertRaw("Ana@Example.com");
    await insertRaw("ana@example.com");

    await assert.rejects(normalizeEmails.up({ context }), /duplicados.*ana@example\.com/);
    assert.deepEqual(await emails(), ["Ana@Example.com", "ana@example.com"]);
  });
});
