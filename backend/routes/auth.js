const express = require("express");
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");
const { User } = require("../models");
const { requireAuth } = require("../middlewares/auth");
const {
  normalizeEmail,
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
      req.session.authAt = Date.now();
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
      validateEmail(normalizeEmail(email)),
      validatePassword(password)
    );
    if (error) return res.status(400).json({ success: false, message: error });

    try {
      const existingUser = await User.findOne({ where: { email: normalizeEmail(email) } });
      if (existingUser) {
        return res.status(409).json({ success: false, message: "Email já cadastrado" });
      }

      const user = await User.create({
        username: username.trim(),
        email,
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
      const user = await User.findOne({ where: { email: normalizeEmail(email) } });
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

  router.patch("/user/profile", requireAuth, async (req, res, next) => {
    const { username, email } = req.body;
    const error = firstError(
      username !== undefined && validateUsername(username),
      email !== undefined && validateEmail(email)
    );
    if (error) return res.status(400).json({ success: false, message: error });

    const user = req.currentUser;
    try {
      if (email !== undefined) {
        const existing = await User.findOne({ where: { email: normalizeEmail(email) } });
        if (existing && existing.id !== user.id) {
          return res
            .status(409)
            .json({ success: false, message: "Email já cadastrado por outro usuário." });
        }
        user.email = email;
      }
      if (username !== undefined) user.username = username.trim();

      await user.save();
      req.session.user = user.toSessionUser();
      res.json({ success: true, user: req.session.user });
    } catch (err) {
      next(err);
    }
  });

  router.put("/user/password", authLimiter, requireAuth, async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    if (typeof currentPassword !== "string" || !currentPassword) {
      return res.status(400).json({ success: false, message: "Informe a senha atual" });
    }
    const error = validatePassword(newPassword);
    if (error) return res.status(400).json({ success: false, message: error });

    const user = req.currentUser;
    try {
      if (!(await bcrypt.compare(currentPassword, user.password))) {
        return res.status(400).json({ success: false, message: "Senha atual incorreta" });
      }

      user.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
      await user.save();
      await startSession(req, user);
      res.json({ success: true, message: "Senha alterada. Outras sessões foram encerradas." });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = createAuthRouter;
