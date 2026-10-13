require("dotenv").config();
const { Sequelize } = require("sequelize");

const {
  PGHOST = "postgres",
  PGPORT = "5432",
  PGUSER = "postgres",
  PGPASSWORD = "postgres",
  PGDATABASE = "sistema_cadastro",
} = process.env;

const connection = {
  host: PGHOST,
  port: Number(PGPORT),
  user: PGUSER,
  password: PGPASSWORD,
  database: PGDATABASE,
};

const sequelize = new Sequelize(PGDATABASE, PGUSER, PGPASSWORD, {
  host: PGHOST,
  port: Number(PGPORT),
  dialect: "postgres",
  logging: false,
});

const User = require("./user")(sequelize);

module.exports = {
  sequelize,
  connection,
  User,
};
