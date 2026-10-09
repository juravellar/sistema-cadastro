process.env.NODE_ENV = "test";
process.env.PGHOST = process.env.TEST_PGHOST || "localhost";
process.env.PGPORT = process.env.TEST_PGPORT || "55432";
process.env.PGUSER = process.env.TEST_PGUSER || "postgres";
process.env.PGPASSWORD = process.env.TEST_PGPASSWORD || "postgres";
process.env.PGDATABASE = process.env.TEST_PGDATABASE || "sistema_cadastro_test";

const bcrypt = require("bcrypt");
const session = require("express-session");
const request = require("supertest");
const createApp = require("../app");
const { sequelize, User } = require("../models");
const { migrate } = require("../db/migrate");

const PASSWORD = "senha-segura-123";

async function setupDatabase() {
  await migrate();
}

async function resetUsers() {
  await User.destroy({ where: {}, truncate: true, restartIdentity: true });
}

function buildApp(options = {}) {
  return createApp({
    sessionStore: new session.MemoryStore(),
    authRateLimit: 1000,
    ...options,
  });
}

async function createUser({ email, role = "user", username = "user" }) {
  return User.create({
    username,
    email,
    role,
    password: await bcrypt.hash(PASSWORD, 4),
  });
}

async function loginAgent(app, email) {
  const agent = request.agent(app);
  const res = await agent.post("/api/login").send({ email, password: PASSWORD });
  if (res.status !== 200) throw new Error(`login falhou: ${res.status}`);
  return agent;
}

module.exports = {
  PASSWORD,
  setupDatabase,
  resetUsers,
  buildApp,
  createUser,
  loginAgent,
  closeDatabase: () => sequelize.close(),
};
