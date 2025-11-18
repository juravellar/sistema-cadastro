var express = require("express");
var router = express.Router();
const { User } = require("../models");
const bcrypt = require("bcrypt");
const ensureAdminAuthenticated = require("../middlewares/admin-auth");

router.get("/", function (req, res) {
  res.json({ message: "Back-end endpoint" });
});

router.post("/signup", async function (req, res) {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email já cadastrado" });
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
    return res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
      redirectTo: newUser.email.includes("@admin") ? "/home-admin" : "/home",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro ao criar usuário" });
  }
});

router.post("/login", async function (req, res) {
  const { email, password } = req.body;

  // Validação básica
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email e senha são obrigatórios" });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Email não cadastrado" });
    }
    const senhaCorreta = await bcrypt.compare(password, user.password);
    if (!senhaCorreta) {
      return res
        .status(401)
        .json({ success: false, message: "Senha incorreta" });
    }
    // Define o usuário na sessão
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    // Debug em desenvolvimento
    if (process.env.NODE_ENV === "development") {
      console.log("✅ Login bem-sucedido - Session ID:", req.sessionID);
      console.log("👤 User salvo na sessão:", req.session.user);
    }

    // Envia a resposta - express-session salva automaticamente quando a resposta é enviada
    // Mas vamos garantir que seja salvo explicitamente
    req.session.save((err) => {
      if (err) {
        console.error("❌ Erro ao salvar sessão:", err);
        return res.status(500).json({
          success: false,
          message: "Erro ao criar sessão",
        });
      }

      // Debug: verificar headers antes de enviar
      if (process.env.NODE_ENV === "development") {
        console.log("💾 Sessão salva. Cookie config:", req.session.cookie);
      }

      // Envia a resposta JSON
      res.json({
        success: true,
        user: { id: user.id, username: user.username, email: user.email },
        redirectTo: user.email.includes("@admin") ? "/home-admin" : "/home",
      });

      // Debug após enviar resposta
      if (process.env.NODE_ENV === "development") {
        res.on("finish", () => {
          const headers = res.getHeaders();
          console.log("📤 Headers enviados:", Object.keys(headers));
          if (headers["set-cookie"]) {
            console.log("🍪 Cookie enviado:", headers["set-cookie"]);
          } else {
            console.warn("⚠️ NENHUM COOKIE FOI ENVIADO NA RESPOSTA!");
          }
        });
      }
    });
  } catch (err) {
    console.error("Erro no login:", err);
    // Garante que sempre retorna JSON válido
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Erro no servidor",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  }
});

router.post("/logout", function (req, res) {
  req.session.destroy(() => {
    res.json({ success: true, message: "Logout realizado" });
  });
});

router.get("/user/profile", function (req, res) {
  // Debug: verificar se a sessão existe
  if (process.env.NODE_ENV === "development") {
    console.log("Session ID:", req.sessionID);
    console.log("Session user:", req.session.user);
    console.log("Cookies recebidos:", req.headers.cookie);
  }

  if (req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res
      .status(401)
      .json({ success: false, message: "Usuário não autenticado" });
  }
});

router.get("/users", ensureAdminAuthenticated, async function (req, res) {
  try {
    const users = await User.findAll({
      attributes: ["id", "username", "email"],
    });
    res.json({ success: true, users });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Erro ao buscar usuários" });
  }
});

router.get("/user/id/:id", ensureAdminAuthenticated, async function (req, res) {
  const { id } = req.params;

  try {
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID inválido. O ID deve ser numérico.",
      });
    }

    const user = await User.findByPk(id, {
      attributes: ["id", "username", "email"],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Usuário com id ${id} não encontrado.`,
      });
    }

    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao buscar usuário.",
    });
  }
});

router.put("/user/id/:id", ensureAdminAuthenticated, async function (req, res) {
  const { id } = req.params;
  const { username, email, password } = req.body;

  try {
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID inválido. O ID deve ser numérico.",
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Usuário com id ${id} não encontrado.`,
      });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser && existingUser.id !== user.id) {
        return res.status(400).json({
          success: false,
          message: "Email já cadastrado por outro usuário.",
        });
      }
      user.email = email;
    }

    if (username) {
      user.username = username;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: `Usuário com id ${id} atualizado com sucesso.`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao atualizar usuário.",
    });
  }
});

router.delete(
  "/user/id/:id",
  ensureAdminAuthenticated,
  async function (req, res) {
    const { id } = req.params;

    try {
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "ID inválido. O ID deve ser numérico.",
        });
      }

      const user = await User.findByPk(id, {
        attributes: ["id", "username", "email"],
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: `Usuário com id ${id} não encontrado.`,
        });
      }

      await user.destroy();

      return res.status(200).json({
        success: true,
        message: `Usuário com id ${id} deletado com sucesso.`,
        user,
      });
    } catch (err) {
      console.error("Erro ao deletar usuário:", err);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao deletar usuário.",
      });
    }
  }
);

module.exports = router;
