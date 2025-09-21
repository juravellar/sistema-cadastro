var express = require("express");
var router = express.Router();
const { User } = require("../models");
const bcrypt = require("bcrypt");

/* GET login/signup page */
router.get("/", function (req, res) {
  res.render("index");
});

/* POST login */
router.post("/login", async function (req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
      };
      if (user.email.includes("@admin")) {
        return res.redirect("/home-admin");
      }
      return res.redirect("/home");
    }
    res.status(401).send("Credenciais inválidas");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro no servidor");
  }
});

/* POST signup */
router.post("/signup", async function (req, res) {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).send("Email já cadastrado");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username: username,
      email: email,
      password: hashedPassword,
    });

    req.session.user = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    };

    if (newUser.email.includes("@admin")) {
      return res.redirect("/home-admin");
    }
    return res.redirect("/home");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao criar usuário");
  }
});

/* POST logout */
router.post("/logout", function (req, res) {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;
