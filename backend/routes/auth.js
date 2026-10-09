const express = require("express");
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");
const { User } = require("../models");
const { requireAuth } = require("../middlewares/auth");
const {
  validateEmail,
  validatePassword,
  validateUsername,
  firstError,
} = require("../lib/validation");

const BCRYPT_ROUNDS = 10;
// Comparar contra um hash real quando o e-mail não existe iguala o tempo de
// resposta e impede descobrir quais e-mails estão cadastrados.
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", BCRYPT_ROUNDS);

function redirectFor(user) {
  return user.role === User.ROLES.ADMIN ? "/home-admin" : "/home";
}

// Regenerar o ID da sessão no login evita session fixation.
function startSession(req, user) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.user = user.toSessionUser();
      req.session.save((saveErr) => (saveErr ? reject(saveErr) : resolve()));
    });
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

  router.post("/signup", authLimiter, async (req, res, next) => {
    const { username, email, password } = req.body;
    const error = firstError(
      validateUsername(username),
      validateEmail(email),
      validatePassword(password)
    );
    if (error) return res.status(400).json({ success: false, message: error });

    try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ success: false, message: "Email já cadastrado" });
      }

      const user = await User.create({
        username: username.trim(),
        email: email.trim(),
        password: await bcrypt.hash(password, BCRYPT_ROUNDS),
        role: User.ROLES.USER,
      });

      await startSession(req, user);
      res.status(201).json({
        success: true,
        user: user.toSessionUser(),
        redirectTo: redirectFor(user),
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/login", authLimiter, async (req, res, next) => {
    const { email, password } = req.body;
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email e senha são obrigatórios" });
    }

    try {
      const user = await User.findOne({ where: { email } });
      const passwordMatches = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);

      if (!user || !passwordMatches) {
        return res.status(401).json({ success: false, message: "Credenciais inválidas" });
      }

      await startSession(req, user);
      res.json({
        success: true,
        user: user.toSessionUser(),
        redirectTo: redirectFor(user),
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/logout", (req, res, next) => {
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie("connect.sid", { path: "/" });
      res.json({ success: true, message: "Logout realizado" });
    });
  });

  router.get("/user/profile", requireAuth, (req, res) => {
    res.json({ success: true, user: req.session.user });
  });

  return router;
}

module.exports = createAuthRouter;
