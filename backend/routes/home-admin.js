var express = require("express");
var router = express.Router();
const ensureAdminAuthenticated = require("../middlewares/admin-auth");

/* GET home admin page */
router.get("/", ensureAdminAuthenticated, function (req, res) {
  res.json({
    success: true,
    message: "Acesso de administrador autorizado",
    user: req.session.user,
  });
});

module.exports = router;
