require("dotenv").config();
const express = require("express");
const logger = require("morgan");
const session = require("express-session");
const cors = require("cors");
const createApiRouter = require("./routes");

const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = process.env.NODE_ENV === "development";
// COOKIE_SECURE=false só quando o TLS não termina antes do app (ex.: compose local sem HTTPS).
const secureCookie = process.env.COOKIE_SECURE
  ? process.env.COOKIE_SECURE === "true"
  : isProduction;

function resolveSessionSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (isProduction) {
    throw new Error("SESSION_SECRET é obrigatório em produção");
  }
  return "dev-only-session-secret";
}

function createPgSessionStore() {
  const PgSession = require("connect-pg-simple")(session);
  const { connection } = require("./models");
  return new PgSession({ conObject: connection, tableName: "session" });
}

function createApp({ sessionStore, authRateLimit } = {}) {
  const app = express();

  // Atrás de nginx: necessário para req.ip correto (rate limit) e cookie secure.
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type"],
    })
  );

  if (process.env.NODE_ENV !== "test") {
    app.use(logger(isProduction ? "combined" : "dev"));
  }
  app.use(express.json({ limit: "10kb" }));

  app.use(
    session({
      store: sessionStore || createPgSessionStore(),
      secret: resolveSessionSecret(),
      resave: false,
      saveUninitialized: false,
      name: "connect.sid",
      cookie: {
        secure: secureCookie,
        httpOnly: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      },
    })
  );

  app.get("/status", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api", createApiRouter({ authRateLimit }));

  app.use((req, res) => {
    res.status(404).json({ success: false, message: "Recurso não encontrado" });
  });

  app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({
      success: false,
      message: status >= 500 ? "Erro interno do servidor" : err.message,
      ...(isDevelopment && { stack: err.stack }),
    });
  });

  return app;
}

module.exports = createApp;
