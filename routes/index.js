var express = require('express');
var router = express.Router();

/* GET login/sign-up page */
router.get('/', function(req, res) {
  res.render('index');
});

/* POST login */
router.post('/login', function(req, res) {
  const { email, password } = req.body;

  if (email === 'teste@teste.com' && password === '123456') {
    req.session.user = { email };
    return res.redirect('/home');
  }

  res.status(401).send('Credenciais inválidas');
});

/* POST sign-up */
router.post('/sign-up', function(req, res) {
  const { username, email, password } = req.body;

  req.session.user = { username, email };
  return res.redirect('/home');
});

/* POST logout */
router.post('/logout', function(req, res) {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
