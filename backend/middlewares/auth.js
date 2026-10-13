const { User } = require("../models");
const { AuthenticationError, ForbiddenError } = require("../lib/errors");
const { destroySession } = require("../lib/session");

// O usuário é relido do banco a cada requisição: sem isso, quem foi excluído
// ou perdeu o perfil de admin manteria o acesso até a sessão expirar.
async function loadCurrentUser(req) {
  if (!req.session.user) return null;

  const user = await User.findByPk(req.session.user.id);
  if (!user || openedBeforePasswordChange(req.session, user)) {
    await destroySession(req);
    return null;
  }

  req.currentUser = user;
  req.session.user = user.toSessionUser();
  return req.session.user;
}

// Trocar a senha encerra as outras sessões: quem roubou um cookie perde o
// acesso assim que o dono troca a senha.
function openedBeforePasswordChange(session, user) {
  if (!user.passwordChangedAt) return false;
  return !session.authAt || user.passwordChangedAt.getTime() > session.authAt;
}

async function requireAuth(req, res, next) {
  if (!(await loadCurrentUser(req))) throw new AuthenticationError();
  next();
}

async function requireAdmin(req, res, next) {
  const user = await loadCurrentUser(req);
  if (!user) throw new AuthenticationError();
  if (user.role !== User.ROLES.ADMIN) throw new ForbiddenError();
  next();
}

module.exports = { requireAuth, requireAdmin };
