const bcrypt = require("bcrypt");
const { sequelize, User } = require("../models");
const {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} = require("../lib/errors");
const {
  normalizeEmail,
  validateEmail,
  validatePassword,
  validateRole,
  validateUsername,
  assertValid,
} = require("../lib/validation");

const BCRYPT_ROUNDS = 10;
// Comparar contra um hash real quando o e-mail não existe iguala o tempo de
// resposta e impede descobrir quais e-mails estão cadastrados.
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", BCRYPT_ROUNDS);
const PUBLIC_ATTRIBUTES = ["id", "username", "email", "role"];
const LAST_ADMIN_MESSAGE = "O sistema precisa de pelo menos um administrador.";

function toPublicUser(user) {
  return { id: user.id, username: user.username, email: user.email, role: user.role };
}

function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function ensureEmailAvailable(email, { exceptId, message }) {
  const existing = await User.findOne({ where: { email: normalizeEmail(email) } });
  if (existing && existing.id !== exceptId) throw new ConflictError(message);
}

// As linhas de admin ficam travadas (SELECT ... FOR UPDATE) até o fim da
// transação. Sem isso, dois admins que se rebaixam ou se excluem ao mesmo
// tempo passam ambos pela checagem e o sistema fica sem nenhum admin.
async function ensureNotLastAdmin(user, transaction) {
  if (user.role !== User.ROLES.ADMIN) return;
  const admins = await User.findAll({
    where: { role: User.ROLES.ADMIN },
    attributes: ["id"],
    lock: transaction.LOCK.UPDATE,
    transaction,
  });
  if (admins.length <= 1) throw new ValidationError(LAST_ADMIN_MESSAGE);
}

async function register({ username, email, password }) {
  assertValid(
    validateUsername(username),
    validateEmail(normalizeEmail(email)),
    validatePassword(password)
  );
  await ensureEmailAvailable(email, { message: "Email já cadastrado" });

  return User.create({
    username: username.trim(),
    email,
    password: await hashPassword(password),
    role: User.ROLES.USER,
  });
}

async function authenticate({ email, password }) {
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    throw new ValidationError("Email e senha são obrigatórios");
  }

  const user = await User.findOne({ where: { email: normalizeEmail(email) } });
  const passwordMatches = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
  if (!user || !passwordMatches) throw new AuthenticationError("Credenciais inválidas");
  return user;
}

async function updateProfile(user, { username, email }) {
  assertValid(
    username !== undefined && validateUsername(username),
    email !== undefined && validateEmail(normalizeEmail(email))
  );
  if (email !== undefined) {
    await ensureEmailAvailable(email, {
      exceptId: user.id,
      message: "Email já cadastrado por outro usuário.",
    });
    user.email = email;
  }
  if (username !== undefined) user.username = username.trim();
  return user.save();
}

async function changePassword(user, { currentPassword, newPassword }) {
  if (typeof currentPassword !== "string" || !currentPassword) {
    throw new ValidationError("Informe a senha atual");
  }
  assertValid(validatePassword(newPassword));
  if (!(await bcrypt.compare(currentPassword, user.password))) {
    throw new ValidationError("Senha atual incorreta");
  }

  user.password = await hashPassword(newPassword);
  return user.save();
}

async function listUsers({ limit, offset }) {
  const { rows, count } = await User.findAndCountAll({
    attributes: PUBLIC_ATTRIBUTES,
    order: [["id", "ASC"]],
    limit,
    offset,
  });
  return { users: rows, total: count };
}

async function findUser(id) {
  const user = await User.findByPk(id);
  if (!user) throw new NotFoundError(`Usuário com id ${id} não encontrado.`);
  return user;
}

async function createUser({ username, email, password, role = User.ROLES.USER }) {
  assertValid(
    validateUsername(username),
    validateEmail(normalizeEmail(email)),
    validatePassword(password),
    validateRole(role)
  );
  await ensureEmailAvailable(email, { message: "Email já cadastrado" });

  return User.create({
    username: username.trim(),
    email,
    password: await hashPassword(password),
    role,
  });
}

async function updateUser({ actorId, user, changes }) {
  const { username, email, password, role } = changes;
  assertValid(
    username !== undefined && validateUsername(username),
    email !== undefined && validateEmail(normalizeEmail(email)),
    password !== undefined && password !== "" && validatePassword(password),
    role !== undefined && validateRole(role)
  );

  const isSelf = user.id === actorId;
  const changesRole = role !== undefined && role !== user.role;
  if (changesRole && isSelf) {
    throw new ValidationError("Você não pode alterar o seu próprio perfil.");
  }
  // A troca da própria senha exige a senha atual e regenera a sessão, o que só
  // changePassword (PUT /api/user/password) faz. Aqui ela encerraria a sessão
  // de quem pediu.
  if (password && isSelf) {
    throw new ValidationError("Para trocar a sua senha, use a página Minha conta.");
  }
  if (email !== undefined) {
    await ensureEmailAvailable(email, {
      exceptId: user.id,
      message: "Email já cadastrado por outro usuário.",
    });
  }

  const passwordHash = password ? await hashPassword(password) : null;
  await sequelize.transaction(async (transaction) => {
    if (changesRole) await ensureNotLastAdmin(user, transaction);

    if (email !== undefined) user.email = email;
    if (username !== undefined) user.username = username.trim();
    if (passwordHash) user.password = passwordHash;
    if (changesRole) user.role = role;
    await user.save({ transaction });
  });
  return user;
}

async function deleteUser({ actorId, user }) {
  if (user.id === actorId) {
    throw new ValidationError("Você não pode excluir sua própria conta.");
  }
  await sequelize.transaction(async (transaction) => {
    await ensureNotLastAdmin(user, transaction);
    await user.destroy({ transaction });
  });
  return user;
}

module.exports = {
  toPublicUser,
  register,
  authenticate,
  updateProfile,
  changePassword,
  listUsers,
  findUser,
  createUser,
  updateUser,
  deleteUser,
};
