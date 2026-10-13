require("dotenv").config({ quiet: true });

const env = process.env.NODE_ENV || "development";
const isProduction = process.env.NODE_ENV === "production";

const TRUE_VALUES = new Set(["true", "1", "yes"]);
const FALSE_VALUES = new Set(["false", "0", "no"]);

function parseBoolean(name, value, fallback) {
  if (value === undefined || value === "") return fallback;
  const normalized = value.trim().toLowerCase();
  if (TRUE_VALUES.has(normalized)) return true;
  if (FALSE_VALUES.has(normalized)) return false;
  throw new Error(`${name} inválido: "${value}" (use true ou false)`);
}

function parsePort(name, value, fallback) {
  if (value === undefined || value === "") return fallback;
  const port = Number(value);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`${name} inválido: "${value}"`);
  }
  return port;
}

// Lido na importação: o Sequelize é criado quando models/ é carregado, e
// migrate, create-admin e o servidor precisam do banco.
const config = Object.freeze({
  env,
  isProduction,
  // Só com NODE_ENV=development explícito: o error handler devolve o stack
  // trace nesse modo, e um servidor sem NODE_ENV não pode vazá-lo.
  isDevelopment: process.env.NODE_ENV === "development",
  isTest: process.env.NODE_ENV === "test",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  db: Object.freeze({
    host: process.env.PGHOST || "postgres",
    port: parsePort("PGPORT", process.env.PGPORT, 5432),
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || "postgres",
    database: process.env.PGDATABASE || "sistema_cadastro",
  }),
});

// Lido só por quem sobe o servidor HTTP (app.js, bin/www): um valor errado
// nessas variáveis não pode impedir migrate e create-admin de rodar.
function serverConfig() {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret && isProduction) {
    throw new Error("SESSION_SECRET é obrigatório em produção");
  }
  return {
    port: parsePort("PORT", process.env.PORT, 3002),
    sessionSecret: sessionSecret || "dev-only-session-secret",
    // Desligar o cookie Secure só faz sentido quando o acesso não passa por
    // HTTPS (ex.: compose de produção acessado por HTTP).
    secureCookie: parseBoolean("COOKIE_SECURE", process.env.COOKIE_SECURE, isProduction),
    sessionMaxAgeMs: 24 * 60 * 60 * 1000,
  };
}

module.exports = { config, serverConfig };
