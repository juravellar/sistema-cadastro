var express = require("express");
var router = express.Router();
const ensureAdminAuthenticated = require("../middlewares/admin-auth");

/* GET home admin page */
router.get("/", ensureAdminAuthenticated, function (req, res) {
  res.render("home-admin", { user: req.session.user });
});

module.exports = router;
