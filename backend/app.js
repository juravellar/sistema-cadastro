const express = require("express");
const logger = require("morgan");
const session = require("express-session");
const cors = require("cors");
const createApiRouter = require("./routes");
const { config, serverConfig } = require("./config");
const { SESSION_COOKIE } = require("./lib/session");

function createPgSessionStore() {
  const PgSession = require("connect-pg-simple")(session);
  return new PgSession({ conObject: config.db, tableName: "session" });
}

// Dois cadastros simultâneos com o mesmo e-mail passam pela checagem de
// duplicidade do serviço, e só o índice único barra o segundo. Os demais erros
// do banco continuam 500 e são logados: indicam bug, não erro do cliente.
function statusFromDatabaseError(err) {
  if (err.name === "SequelizeUniqueConstraintError") {
    return { status: 409, message: "Já existe um cadastro com esses dados." };
  }
  return null;
}

function createApp({ sessionStore, authRateLimit, server = serverConfig() } = {}) {
  const app = express();

  // Atrás de nginx: necessário para req.ip correto (rate limit) e cookie secure.
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(
    cors({
      origin: config.frontendUrl,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type"],
    })
  );

  if (!config.isTest) {
    app.use(logger(config.isProduction ? "combined" : "dev"));
  }
  app.use(express.json({ limit: "10kb" }));

  app.use(
    session({
      store: sessionStore || createPgSessionStore(),
      secret: server.sessionSecret,
      resave: false,
      saveUninitialized: false,
      name: SESSION_COOKIE,
      cookie: {
        secure: server.secureCookie,
        httpOnly: true,
        sameSite: "lax",
        maxAge: server.sessionMaxAgeMs,
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
    const databaseError = statusFromDatabaseError(err);
    const status = databaseError?.status || err.status || err.statusCode || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({
      success: false,
      message: databaseError?.message || (status >= 500 ? "Erro interno do servidor" : err.message),
      ...(config.isDevelopment && { stack: err.stack }),
    });
  });

  return app;
}

module.exports = createApp;
