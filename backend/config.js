require("dotenv").config();

const env = process.env.NODE_ENV || "development";
const isProduction = env === "production";

function parseBoolean(value, fallback) {
  if (value === undefined || value === "") return fallback;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`Valor booleano inválido: "${value}" (use true ou false)`);
}

function parsePort(name, value, fallback) {
  if (value === undefined || value === "") return fallback;
  const port = Number(value);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`${name} inválido: "${value}"`);
  }
  return port;
}

const config = Object.freeze({
  env,
  isProduction,
  isDevelopment: env === "development",
  isTest: env === "test",
  port: parsePort("PORT", process.env.PORT, 3002),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  session: Object.freeze({
    // Desligar o cookie Secure só faz sentido quando o acesso não passa por
    // HTTPS (ex.: compose de produção acessado por HTTP).
    secureCookie: parseBoolean(process.env.COOKIE_SECURE, isProduction),
    maxAgeMs: 24 * 60 * 60 * 1000,
  }),
  db: Object.freeze({
    host: process.env.PGHOST || "postgres",
    port: parsePort("PGPORT", process.env.PGPORT, 5432),
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || "postgres",
    database: process.env.PGDATABASE || "sistema_cadastro",
  }),
});

// Exigido só por quem sobe o servidor HTTP: migrate e create-admin rodam em
// produção sem SESSION_SECRET.
function requireSessionSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (isProduction) throw new Error("SESSION_SECRET é obrigatório em produção");
  return "dev-only-session-secret";
}

module.exports = { config, requireSessionSecret };
