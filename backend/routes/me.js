const express = require("express");
const { requireAuth } = require("../middlewares/auth");
const { startSession } = require("../lib/session");
const userService = require("../services/user-service");

function createMeRouter({ authLimiter }) {
  const router = express.Router();

  router.get("/", requireAuth, (req, res) => {
    res.json({ success: true, user: req.session.user });
  });

  router.patch("/", requireAuth, async (req, res) => {
    const user = await userService.updateProfile(req.currentUser, req.body ?? {});
    req.session.user = user.toSessionUser();
    res.json({ success: true, user: req.session.user });
  });

  router.put("/password", requireAuth, authLimiter, async (req, res) => {
    const user = await userService.changePassword(req.currentUser, req.body ?? {});
    await startSession(req, user);
    res.json({ success: true, message: "Senha alterada. Outras sessões foram encerradas." });
  });

  return router;
}

module.exports = createMeRouter;
