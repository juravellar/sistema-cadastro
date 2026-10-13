const express = require("express");
const { requireAdmin } = require("../middlewares/auth");
const { ValidationError } = require("../lib/errors");
const { parseId } = require("../lib/validation");
const userService = require("../services/user-service");

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

function parsePagination(query) {
  const limit = Math.min(
    Math.max(parseInt(query.limit, 10) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE
  );
  const offset = Math.max(parseInt(query.offset, 10) || 0, 0);
  return { limit, offset };
}

async function loadTargetUser(req, res, next) {
  const id = parseId(req.params.id);
  if (id === null) throw new ValidationError("ID inválido. O ID deve ser numérico.");
  req.targetUser = await userService.findUser(id);
  next();
}

const router = express.Router();

router.get("/users", requireAdmin, async (req, res) => {
  const { limit, offset } = parsePagination(req.query);
  const { users, total } = await userService.listUsers({ limit, offset });
  res.json({ success: true, users, total, limit, offset });
});

router.post("/users", requireAdmin, async (req, res) => {
  const user = await userService.createUser(req.body ?? {});
  res.status(201).json({ success: true, user: userService.toPublicUser(user) });
});

router.get("/user/id/:id", requireAdmin, loadTargetUser, (req, res) => {
  res.json({ success: true, user: userService.toPublicUser(req.targetUser) });
});

router.put("/user/id/:id", requireAdmin, loadTargetUser, async (req, res) => {
  const user = await userService.updateUser({
    actorId: req.currentUser.id,
    user: req.targetUser,
    changes: req.body ?? {},
  });
  res.json({
    success: true,
    message: `Usuário com id ${user.id} atualizado com sucesso.`,
    user: userService.toPublicUser(user),
  });
});

router.delete("/user/id/:id", requireAdmin, loadTargetUser, async (req, res) => {
  const user = await userService.deleteUser({
    actorId: req.currentUser.id,
    user: req.targetUser,
  });
  res.json({
    success: true,
    message: `Usuário com id ${user.id} deletado com sucesso.`,
    user: userService.toPublicUser(user),
  });
});

module.exports = router;
