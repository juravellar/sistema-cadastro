function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
      return next();
    }
    res.status(401).send(`
      <script>
        alert('⚠️ Entrada indevida! Faça login primeiro.');
        window.location.href = '/';
      </script>
    `);
    
  }
  
  module.exports = ensureAuthenticated;