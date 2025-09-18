var express = require("express");
var router = express.Router();
const { User } = require("../models");
const bcrypt = require("bcrypt");

/* GET login/sign-up page */
router.get("/", function (req, res) {
  res.render("index");
});

/* POST login */
router.post("/login", async function (req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.senha))) {
      req.session.user = { id: user.id, nome: user.nome, email: user.email };
      return res.redirect("/home");
    }
    res.status(401).send("Credenciais inválidas");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro no servidor");
  }
});

/* POST sign-up */
router.post("/sign-up", async function (req, res) {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).send("Email já cadastrado");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      nome: username,
      email: email,
      senha: hashedPassword,
    });

    req.session.user = {
      id: newUser.id,
      nome: newUser.nome,
      email: newUser.email,
    };
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
