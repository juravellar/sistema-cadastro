require("dotenv").config();
const { Sequelize } = require("sequelize");

const {
  PGHOST = "postgres",
  PGPORT = "5432",
  PGUSER = "postgres",
  PGPASSWORD = "postgres",
  PGDATABASE = "sistema_cadastro",
  NODE_ENV = "development",
} = process.env;

console.log("🔍 Database Configuration Debug:");
console.log("PGHOST:", PGHOST);
console.log("PGPORT:", PGPORT);
console.log("PGUSER:", PGUSER);
console.log("PGDATABASE:", PGDATABASE);
console.log("NODE_ENV:", NODE_ENV);

const sequelize = new Sequelize(PGDATABASE, PGUSER, PGPASSWORD, {
  host: PGHOST,
  port: Number(PGPORT),
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: false, // ❌ Nunca usar SSL no Docker
  },
});

const User = require("./user")(sequelize);

module.exports = {
  sequelize,
  User,
};
