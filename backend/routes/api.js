var express = require("express");
var router = express.Router();
const { User } = require("../models");
const bcrypt = require("bcrypt");
const ensureAdminAuthenticated = require("../middlewares/admin-auth");

// API root
router.get("/", function (req, res) {
  res.json({
    message: "API endpoint",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
router.get("/health", async function (req, res) {
  try {
    // Test database connection
    const { sequelize } = require("../models");
    await sequelize.authenticate();

    res.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// API signup
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

// API login
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
      return res.json({
        success: true,
        user: { id: user.id, username: user.username, email: user.email },
        redirectTo: user.email.includes("@admin") ? "/home-admin" : "/home",
      });
    }
    res.status(401).json({ success: false, message: "Credenciais inválidas" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro no servidor" });
  }
});

// API logout
router.post("/logout", function (req, res) {
  req.session.destroy(() => {
    res.json({ success: true, message: "Logout realizado" });
  });
});

// API get user profile
router.get("/user/profile", function (req, res) {
  if (req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res
      .status(401)
      .json({ success: false, message: "Usuário não autenticado" });
  }
});

// API get users
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

// API get user by id
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

// API update user by id
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

// API delete user by id
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
