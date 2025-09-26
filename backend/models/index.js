require("dotenv").config();

const { Sequelize } = require("sequelize");

const {
  DATABASE_URL,
  PGHOST,
  PGPORT,
  PGUSER,
  PGPASSWORD,
  PGDATABASE,
  NODE_ENV,
  DATABASE_SSL,
} = process.env;

console.log("🔍 Database Configuration Debug:");
console.log("DATABASE_URL:", DATABASE_URL ? "SET" : "NOT SET");
console.log("PGHOST:", PGHOST || "127.0.0.1 (default)");
console.log("PGPORT:", PGPORT || "5432 (default)");
console.log("PGUSER:", PGUSER || "postgres (default)");
console.log("PGDATABASE:", PGDATABASE || "sistema-cadastro (default)");
console.log("NODE_ENV:", NODE_ENV || "production (default)");
console.log("DATABASE_SSL:", DATABASE_SSL === "true" ? "true" : "false");

const useUrl = !!DATABASE_URL;

const sequelize = useUrl
  ? new Sequelize(DATABASE_URL, {
      dialect: "postgres",
      logging: false,
      dialectOptions:
        DATABASE_SSL === "true"
          ? { ssl: { require: true, rejectUnauthorized: false } }
          : {},
    })
  : new Sequelize(
      PGDATABASE || "sistema-cadastro",
      PGUSER || "postgres",
      PGPASSWORD || "0000",
      {
        host: PGHOST || "127.0.0.1",
        port: PGPORT ? Number(PGPORT) : 5432,
        dialect: "postgres",
        logging: false,
      }
    );

const User = require("./user")(sequelize);

module.exports = {
  sequelize,
  User,
};
