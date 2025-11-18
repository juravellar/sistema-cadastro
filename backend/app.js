const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();

const indexRouter = require("./routes/index");
const homeRouter = require("./routes/home");
const homeAdminRouter = require("./routes/home-admin");
const { sequelize } = require("./models");
const createDatabase = require("./scripts/create-database");

const app = express();

// Configuração CORS para permitir credenciais
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Configuração de sessão melhorada
const isProduction = process.env.NODE_ENV === "production";
app.use(
  session({
    secret: process.env.SESSION_SECRET || "segredo-dev",
    resave: false,
    saveUninitialized: true, // Mudado para true para garantir que sessões sejam criadas
    name: "connect.sid", // Nome explícito do cookie
    cookie: {
      secure: false, // Sempre false em desenvolvimento (mesmo que seja produção local)
      httpOnly: true, // Previne acesso via JavaScript (segurança)
      sameSite: "lax", // "lax" funciona melhor em desenvolvimento com proxy
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      path: "/", // Path explícito para garantir que funcione em todas as rotas
      domain: undefined, // Deixa o navegador decidir o domínio
    },
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get("/status", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/", indexRouter);
app.use("/home", homeRouter);
app.use("/home-admin", homeAdminRouter);
app.use("/api", indexRouter);

(async () => {
  try {
    await createDatabase();

    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso.");

    await sequelize.sync({
      force: false,
      alter: process.env.NODE_ENV === "production",
    });
    console.log("Banco de dados sincronizado com sucesso.");

    const bcrypt = require("bcrypt");
    const { User } = require("./models");

    const adminExists = await User.findOne({
      where: { email: "admin@admin.com" },
    });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin", 10);
      await User.create({
        username: "admin",
        email: "admin@admin.com",
        password: hashedPassword,
      });
      console.log("Usuário admin criado: admin@admin.com / admin");
    } else {
      console.log("Usuário admin já existe.");
    }
  } catch (err) {
    console.error("Erro ao sincronizar o banco:", err);
    console.error(
      "Verifique se o PostgreSQL está rodando e as credenciais estão corretas."
    );
    console.log(
      "Aplicação iniciará sem conexão com o banco. Tente novamente mais tarde."
    );
    if (process.env.NODE_ENV === "production") {
      console.log("Continuando em modo de produção sem banco de dados...");
    }
  }
})();

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
      status: err.status || 500,
      ...(req.app.get("env") === "development" && { stack: err.stack }),
    },
  });
});

module.exports = app;
