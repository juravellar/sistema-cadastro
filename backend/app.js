const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
require("dotenv").config();

const indexRouter = require("./routes/index");
const homeRouter = require("./routes/home");
const homeAdminRouter = require("./routes/home-admin");
const apiRouter = require("./routes/api");
const { sequelize } = require("./models");
const createDatabase = require("./scripts/create-database");

const app = express();

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
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

app.use("/", indexRouter);
app.use("/home", homeRouter);
app.use("/home-admin", homeAdminRouter);
app.use("/api", apiRouter);

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
