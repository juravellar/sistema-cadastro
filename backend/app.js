const express = require("express");
const logger = require("morgan");
const session = require("express-session");
const cors = require("cors");
const createApiRouter = require("./routes");
const { config, requireSessionSecret } = require("./config");

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
      secret: requireSessionSecret(),
      resave: false,
      saveUninitialized: false,
      name: "connect.sid",
      cookie: {
        secure: config.session.secureCookie,
        httpOnly: true,
        sameSite: "lax",
        maxAge: config.session.maxAgeMs,
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
      ...(config.isDevelopment && { stack: err.stack }),
    });
  });

  return app;
}

module.exports = createApp;
