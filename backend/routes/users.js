const express = require("express");
const bcrypt = require("bcrypt");
const { sequelize, User } = require("../models");
const { requireAdmin } = require("../middlewares/auth");
const {
  normalizeEmail,
  validateEmail,
  validatePassword,
  validateRole,
  validateUsername,
  firstError,
  parseId,
} = require("../lib/validation");

const PUBLIC_ATTRIBUTES = ["id", "username", "email", "role"];
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;
const BCRYPT_ROUNDS = 10;

function toPublicUser(user) {
  return { id: user.id, username: user.username, email: user.email, role: user.role };
}

function badRequest(res, message) {
  return res.status(400).json({ success: false, message });
}

function parsePagination(query) {
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
  const offset = Math.max(parseInt(query.offset, 10) || 0, 0);
  return { limit, offset };
}

function emailTaken(email, exceptId) {
  return User.findOne({ where: { email: normalizeEmail(email) } }).then(
    (existing) => Boolean(existing) && existing.id !== exceptId
  );
}

// As linhas de admin ficam travadas (SELECT ... FOR UPDATE) até o fim da
// transação. Sem isso, dois admins que se rebaixam ou se excluem ao mesmo
// tempo passam ambos pela checagem e o sistema fica sem nenhum admin.
async function wouldRemoveLastAdmin(user, transaction) {
  if (user.role !== User.ROLES.ADMIN) return false;
  const admins = await User.findAll({
    where: { role: User.ROLES.ADMIN },
    attributes: ["id"],
    lock: transaction.LOCK.UPDATE,
    transaction,
  });
  return admins.length <= 1;
}

const LAST_ADMIN_MESSAGE = "O sistema precisa de pelo menos um administrador.";

function requireValidId(req, res, next) {
  const id = parseId(req.params.id);
  if (id === null) return badRequest(res, "ID inválido. O ID deve ser numérico.");
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

router.post("/users", requireAdmin, async (req, res, next) => {
  const { username, email, password, role = User.ROLES.USER } = req.body;
  const error = firstError(
    validateUsername(username),
    validateEmail(email),
    validatePassword(password),
    validateRole(role)
  );
  if (error) return badRequest(res, error);

  try {
    if (await emailTaken(email)) {
      return res.status(409).json({ success: false, message: "Email já cadastrado" });
    }

    const user = await User.create({
      username: username.trim(),
      email,
      password: await bcrypt.hash(password, BCRYPT_ROUNDS),
      role,
    });
    res.status(201).json({ success: true, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.get("/user/id/:id", requireAdmin, requireValidId, loadTargetUser, (req, res) => {
  res.json({ success: true, user: toPublicUser(req.targetUser) });
});

router.put("/user/id/:id", requireAdmin, requireValidId, loadTargetUser, async (req, res, next) => {
  const { username, email, password, role } = req.body;
  const error = firstError(
    username !== undefined && validateUsername(username),
    email !== undefined && validateEmail(email),
    password !== undefined && password !== "" && validatePassword(password),
    role !== undefined && validateRole(role)
  );
  if (error) return badRequest(res, error);

  const user = req.targetUser;
  const changesRole = role !== undefined && role !== user.role;

  try {
    if (changesRole && user.id === req.session.user.id) {
      return badRequest(res, "Você não pode alterar o seu próprio perfil.");
    }
    if (email !== undefined && (await emailTaken(email, user.id))) {
      return res
        .status(409)
        .json({ success: false, message: "Email já cadastrado por outro usuário." });
    }

    const passwordHash = password ? await bcrypt.hash(password, BCRYPT_ROUNDS) : null;
    const saved = await sequelize.transaction(async (transaction) => {
      if (changesRole && (await wouldRemoveLastAdmin(user, transaction))) return false;

      if (email !== undefined) user.email = email;
      if (username !== undefined) user.username = username.trim();
      if (passwordHash) user.password = passwordHash;
      if (changesRole) user.role = role;
      await user.save({ transaction });
      return true;
    });
    if (!saved) return badRequest(res, LAST_ADMIN_MESSAGE);

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
  const user = req.targetUser;

  try {
    if (user.id === req.session.user.id) {
      return badRequest(res, "Você não pode excluir sua própria conta.");
    }
    const deleted = await sequelize.transaction(async (transaction) => {
      if (await wouldRemoveLastAdmin(user, transaction)) return false;
      await user.destroy({ transaction });
      return true;
    });
    if (!deleted) return badRequest(res, LAST_ADMIN_MESSAGE);
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
