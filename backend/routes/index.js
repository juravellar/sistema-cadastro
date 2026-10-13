const express = require("express");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("../models");
const { destroySession } = require("../lib/session");
const createAuthRouter = require("./auth");
const createMeRouter = require("./me");
const usersRouter = require("./users");

const LEGACY_PATHS = ["/login", "/signup", "/user/profile", "/user/password", "/user/id/:id"];

function createApiRouter({ authRateLimit = 10 } = {}) {
  const router = express.Router();

  // Um limitador só para login, cadastro e troca de senha: as tentativas de
  // adivinhar senha somam no mesmo contador por IP, qualquer que seja a rota.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: authRateLimit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { success: false, message: "Muitas tentativas. Tente novamente em alguns minutos." },
  });

  router.get("/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  router.get("/health/detailed", async (req, res) => {
    try {
      await sequelize.authenticate();
      res.json({ status: "healthy", database: "connected", timestamp: new Date().toISOString() });
    } catch {
      res.status(503).json({
        status: "unhealthy",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Abas abertas com o frontend anterior à padronização REST continuam
  // chamando essas rotas depois do deploy. O frontend antigo exibe a
  // mensagem de erro do login, então o usuário sabe que precisa recarregar.
  // O logout antigo precisa continuar encerrando a sessão: sem isso, quem sai
  // por uma aba antiga continua logado no servidor (problema sério em
  // computador compartilhado).
  router.post("/logout", async (req, res) => {
    await destroySession(req);
    res.clearCookie("connect.sid", { path: "/" });
    res.json({ success: true, message: "Logout realizado" });
  });

  router.all(LEGACY_PATHS, (req, res) => {
    res
      .status(410)
      .json({ success: false, message: "O sistema foi atualizado. Recarregue a página." });
  });

  router.use("/auth", createAuthRouter({ authLimiter }));
  router.use("/me", createMeRouter({ authLimiter }));
  router.use("/users", usersRouter);

  return router;
}

module.exports = createApiRouter;
