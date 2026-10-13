const { describe, it, before, beforeEach, after } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const bcrypt = require("bcrypt");
const { setupDatabase, resetUsers, createUser, closeDatabase } = require("./helpers");
const { User } = require("../models");

const SCRIPT = path.join(__dirname, "..", "scripts", "create-admin.js");
const EMPTY_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "create-admin-test-"));

function runCreateAdmin(env) {
  return spawnSync(process.execPath, [SCRIPT], {
    cwd: EMPTY_DIR,
    encoding: "utf8",
    env: {
      PATH: process.env.PATH,
      NODE_ENV: "test",
      PGHOST: process.env.PGHOST,
      PGPORT: process.env.PGPORT,
      PGUSER: process.env.PGUSER,
      PGPASSWORD: process.env.PGPASSWORD,
      PGDATABASE: process.env.PGDATABASE,
      ...env,
    },
  });
}

describe("npm run create-admin", () => {
  before(setupDatabase);
  beforeEach(resetUsers);
  after(async () => {
    fs.rmSync(EMPTY_DIR, { recursive: true, force: true });
    await closeDatabase();
  });

  it("cria um admin com e-mail normalizado", async () => {
    const run = runCreateAdmin({
      ADMIN_EMAIL: " Chefe@Example.com ",
      ADMIN_PASSWORD: "senha-forte-123",
    });

    assert.equal(run.status, 0, run.stderr);
    assert.match(run.stdout, /Admin chefe@example\.com criado/);
    const user = await User.findOne({ where: { email: "chefe@example.com" } });
    assert.equal(user.role, "admin");
    assert.ok(await bcrypt.compare("senha-forte-123", user.password));
  });

  it("promove um usuário existente e troca a senha se informada", async () => {
    await createUser({ email: "maria@example.com" });

    const run = runCreateAdmin({
      ADMIN_EMAIL: "maria@example.com",
      ADMIN_PASSWORD: "nova-senha-456",
    });

    assert.equal(run.status, 0, run.stderr);
    const user = await User.findOne({ where: { email: "maria@example.com" } });
    assert.equal(user.role, "admin");
    assert.ok(await bcrypt.compare("nova-senha-456", user.password));
  });

  it("falha sem criar nada quando a senha é fraca", async () => {
    const run = runCreateAdmin({ ADMIN_EMAIL: "x@example.com", ADMIN_PASSWORD: "curta" });

    assert.notEqual(run.status, 0);
    assert.match(run.stderr, /8 caracteres/);
    assert.equal(await User.count(), 0);
  });

  it("recusa e-mail inválido", () => {
    const run = runCreateAdmin({ ADMIN_EMAIL: "invalido", ADMIN_PASSWORD: "senha-forte-123" });
    assert.notEqual(run.status, 0);
    assert.match(run.stderr, /Email inválido/);
  });

  it("falha sem ADMIN_EMAIL", () => {
    const run = runCreateAdmin({});
    assert.notEqual(run.status, 0);
    assert.match(run.stderr, /ADMIN_EMAIL/);
  });
});
