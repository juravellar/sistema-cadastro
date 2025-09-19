function ensureAdminAuthenticated(req, res, next) {
  if (req.session.user && req.session.user.email === "admin@admin.com") {
    return next();
  }
  res.status(401).send(`
    <script>
      alert('⚠️ Acesso negado! Apenas administradores podem acessar esta página.');
      window.location.href = '/home';
    </script>
  `);
}

module.exports = ensureAdminAuthenticated;
