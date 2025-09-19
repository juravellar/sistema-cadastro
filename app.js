const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
require("dotenv").config();

const indexRouter = require("./routes/index");
const homeRouter = require("./routes/home");
const apiRouter = require("./routes/api");
const { sequelize } = require("./models");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// sessão
app.use(
  session({
    secret: process.env.SESSION_SECRET || "segredo-dev",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

// rotas
app.use("/", indexRouter);
app.use("/home", homeRouter);
app.use("/api", apiRouter);

// database sync
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("Banco sincronizado com sucesso.");
  } catch (err) {
    console.error("Erro ao sincronizar o banco:", err);
  }
})();

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
