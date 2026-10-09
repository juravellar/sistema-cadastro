const express = require("express");
const { sequelize } = require("../models");
const createAuthRouter = require("./auth");
const usersRouter = require("./users");

function createApiRouter(options = {}) {
  const router = express.Router();

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

  router.use(createAuthRouter(options));
  router.use(usersRouter);

  return router;
}

module.exports = createApiRouter;
