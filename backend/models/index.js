const { Sequelize } = require("sequelize");

const {
  DATABASE_URL,
  PGHOST,
  PGPORT,
  PGUSER,
  PGPASSWORD,
  PGDATABASE,
  NODE_ENV,
} = process.env;

console.log("🔍 Database Configuration Debug:");
console.log("DATABASE_URL:", DATABASE_URL ? "SET" : "NOT SET");
console.log("PGHOST:", PGHOST || "localhost (default)");
console.log("PGPORT:", PGPORT || "5432 (default)");
console.log("PGUSER:", PGUSER || "postgres (default)");
console.log("PGDATABASE:", PGDATABASE || "sistema-cadastro (default)");
console.log("NODE_ENV:", NODE_ENV || "production (default)");

const useUrl = !!DATABASE_URL;

const sequelize = useUrl
  ? new Sequelize(DATABASE_URL, {
      dialect: "postgres",
      logging: false,
      dialectOptions:
        NODE_ENV === "production"
          ? { ssl: { require: true, rejectUnauthorized: false } }
          : {},
    })
  : new Sequelize(
      PGDATABASE || "sistema-cadastro",
      PGUSER || "postgres",
      PGPASSWORD || "0000",
      {
        host: PGHOST || "localhost",
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
