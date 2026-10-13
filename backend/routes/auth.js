const express = require("express");
const rateLimit = require("express-rate-limit");
const { User } = require("../models");
const { requireAuth } = require("../middlewares/auth");
const userService = require("../services/user-service");

function redirectFor(user) {
  return user.role === User.ROLES.ADMIN ? "/home-admin" : "/home";
}

// Regenerar o ID da sessão no login evita session fixation.
function startSession(req, user) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.user = user.toSessionUser();
      req.session.authAt = Date.now();
      req.session.save((saveErr) => (saveErr ? reject(saveErr) : resolve()));
    });
  });
}

function destroySession(req) {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => (err ? reject(err) : resolve()));
  });
}

function createAuthRouter({ authRateLimit = 10 } = {}) {
  const router = express.Router();

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: authRateLimit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { success: false, message: "Muitas tentativas. Tente novamente em alguns minutos." },
  });

  router.post("/signup", authLimiter, async (req, res) => {
    const user = await userService.register(req.body ?? {});
    await startSession(req, user);
    res
      .status(201)
      .json({ success: true, user: user.toSessionUser(), redirectTo: redirectFor(user) });
  });

  router.post("/login", authLimiter, async (req, res) => {
    const user = await userService.authenticate(req.body ?? {});
    await startSession(req, user);
    res.json({ success: true, user: user.toSessionUser(), redirectTo: redirectFor(user) });
  });

  router.post("/logout", async (req, res) => {
    await destroySession(req);
    res.clearCookie("connect.sid", { path: "/" });
    res.json({ success: true, message: "Logout realizado" });
  });

  router.get("/user/profile", requireAuth, (req, res) => {
    res.json({ success: true, user: req.session.user });
  });

  router.patch("/user/profile", requireAuth, async (req, res) => {
    const user = await userService.updateProfile(req.currentUser, req.body ?? {});
    req.session.user = user.toSessionUser();
    res.json({ success: true, user: req.session.user });
  });

  router.put("/user/password", authLimiter, requireAuth, async (req, res) => {
    const user = await userService.changePassword(req.currentUser, req.body ?? {});
    await startSession(req, user);
    res.json({ success: true, message: "Senha alterada. Outras sessões foram encerradas." });
  });

  return router;
}

module.exports = createAuthRouter;
