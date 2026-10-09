const express = require("express");
const bcrypt = require("bcrypt");
const { User } = require("../models");
const { requireAdmin } = require("../middlewares/auth");
const {
  validateEmail,
  validatePassword,
  validateUsername,
  firstError,
  parseId,
} = require("../lib/validation");

const PUBLIC_ATTRIBUTES = ["id", "username", "email", "role"];
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

function toPublicUser(user) {
  return { id: user.id, username: user.username, email: user.email, role: user.role };
}

function parsePagination(query) {
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
  const offset = Math.max(parseInt(query.offset, 10) || 0, 0);
  return { limit, offset };
}

function requireValidId(req, res, next) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res
      .status(400)
      .json({ success: false, message: "ID inválido. O ID deve ser numérico." });
  }
  req.userId = id;
  next();
}

async function loadTargetUser(req, res, next) {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: `Usuário com id ${req.userId} não encontrado.` });
    }
    req.targetUser = user;
    next();
  } catch (err) {
    next(err);
  }
}

const router = express.Router();

router.get("/users", requireAdmin, async (req, res, next) => {
  try {
    const { limit, offset } = parsePagination(req.query);
    const { rows, count } = await User.findAndCountAll({
      attributes: PUBLIC_ATTRIBUTES,
      order: [["id", "ASC"]],
      limit,
      offset,
    });
    res.json({ success: true, users: rows, total: count, limit, offset });
  } catch (err) {
    next(err);
  }
});

router.get("/user/id/:id", requireAdmin, requireValidId, loadTargetUser, (req, res) => {
  res.json({ success: true, user: toPublicUser(req.targetUser) });
});

router.put("/user/id/:id", requireAdmin, requireValidId, loadTargetUser, async (req, res, next) => {
  const { username, email, password } = req.body;
  const error = firstError(
    username !== undefined && validateUsername(username),
    email !== undefined && validateEmail(email),
    password !== undefined && password !== "" && validatePassword(password)
  );
  if (error) return res.status(400).json({ success: false, message: error });

  const user = req.targetUser;
  try {
    if (email !== undefined && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res
          .status(409)
          .json({ success: false, message: "Email já cadastrado por outro usuário." });
      }
      user.email = email.trim();
    }
    if (username !== undefined) user.username = username.trim();
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    if (req.session.user.id === user.id) {
      req.session.user = user.toSessionUser();
    }

    res.json({
      success: true,
      message: `Usuário com id ${user.id} atualizado com sucesso.`,
      user: toPublicUser(user),
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/user/id/:id", requireAdmin, requireValidId, loadTargetUser, async (req, res, next) => {
  if (req.session.user.id === req.userId) {
    return res
      .status(400)
      .json({ success: false, message: "Você não pode excluir sua própria conta." });
  }

  try {
    const user = req.targetUser;
    await user.destroy();
    res.json({
      success: true,
      message: `Usuário com id ${user.id} deletado com sucesso.`,
      user: toPublicUser(user),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
