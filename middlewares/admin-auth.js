function ensureAdminAuthenticated(req, res, next) {
  const user = req.session?.user;

  if (!user) {
    return res.status(401).send(`
      <script>
        alert('⚠️ Acesso negado! Apenas administradores podem acessar esta página. Faça login primeiro.');
        window.location.href = '/';
      </script>
    `);
  }

  if (user.email && user.email.includes('@admin')) {
    return next();
  }

  return res.status(403).send(`
    <script>
      alert('⚠️ Acesso negado! Apenas administradores podem acessar esta página.');
      window.location.href = '/home';
    </script>
  `);
}

module.exports = ensureAdminAuthenticated;
