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
const apiRouter = require("./routes/api");
const { sequelize } = require("./models");
const createDatabase = require("./scripts/create-database");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Configuração de CORS para produção
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [process.env.FRONTEND_URL, process.env.BACKEND_URL]
        : ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "segredo-dev",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use("/", indexRouter);
app.use("/home", homeRouter);
app.use("/home-admin", homeAdminRouter);
app.use("/api", apiRouter);

// Initialize database asynchronously without blocking app startup
(async () => {
  try {
    await createDatabase();

    await sequelize.authenticate();
    console.log("Conexão com o banco de dados estabelecida com sucesso.");

    await sequelize.sync({
      force: false,
      alter: process.env.NODE_ENV === "development",
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
    // Don't exit the process, let the app start anyway
    console.log(
      "Aplicação iniciará sem conexão com o banco. Tente novamente mais tarde."
    );
  }
})();

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
