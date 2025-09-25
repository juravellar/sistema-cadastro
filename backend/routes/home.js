var express = require("express");
var router = express.Router();
const ensureAuthenticated = require("../middlewares/auth");

/* GET home page */
router.get("/", ensureAuthenticated, function (req, res) {
  res.json({
    success: true,
    message: "Acesso autorizado",
    user: req.session.user,
  });
});

module.exports = router;
