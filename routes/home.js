var express = require('express');
var router = express.Router();
const ensureAuthenticated = require('../middlewares/auth');

/* GET home page */
router.get('/', ensureAuthenticated, function(req, res) {
  res.render('home', { user: req.session.user });
});

module.exports = router;