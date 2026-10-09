function requireAuth(req, res, next) {
  if (req.session.user) return next();
  res.status(401).json({ success: false, message: "Usuário não autenticado" });
}

function requireAdmin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Usuário não autenticado" });
  }
  if (req.session.user.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Apenas administradores podem acessar este recurso" });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
