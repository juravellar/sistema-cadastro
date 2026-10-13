const express = require("express");
const { User } = require("../models");
const { startSession, logout } = require("../lib/session");
const userService = require("../services/user-service");

function redirectFor(user) {
  return user.role === User.ROLES.ADMIN ? "/home-admin" : "/home";
}

function createAuthRouter({ authLimiter }) {
  const router = express.Router();

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

  router.post("/logout", logout);

  return router;
}

module.exports = createAuthRouter;
