const { User } = require("../models");

function unauthorized(res) {
  return res.status(401).json({ success: false, message: "Usuário não autenticado" });
}

function destroySession(req) {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => (err ? reject(err) : resolve()));
  });
}

// O usuário é relido do banco a cada requisição: sem isso, quem foi excluído
// ou perdeu o perfil de admin manteria o acesso até a sessão expirar.
async function loadCurrentUser(req) {
  if (!req.session.user) return null;

  const user = await User.findByPk(req.session.user.id);
  if (!user) {
    await destroySession(req);
    return null;
  }

  req.session.user = user.toSessionUser();
  return req.session.user;
}

function requireAuth(req, res, next) {
  loadCurrentUser(req)
    .then((user) => (user ? next() : unauthorized(res)))
    .catch(next);
}

function requireAdmin(req, res, next) {
  loadCurrentUser(req)
    .then((user) => {
      if (!user) return unauthorized(res);
      if (user.role !== User.ROLES.ADMIN) {
        return res
          .status(403)
          .json({ success: false, message: "Apenas administradores podem acessar este recurso" });
      }
      next();
    })
    .catch(next);
}

module.exports = { requireAuth, requireAdmin };
