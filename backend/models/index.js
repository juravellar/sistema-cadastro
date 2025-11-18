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

const useUrl = !!DATABASE_URL;

// Determina se deve usar SSL baseado na variável DATABASE_SSL ou NODE_ENV
const useSSL = DATABASE_SSL === "true" || NODE_ENV === "production";

const sequelize = useUrl
  ? new Sequelize(DATABASE_URL, {
      dialect: "postgres",
      logging: false,
      dialectOptions: useSSL
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : { ssl: false },
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
        dialectOptions: useSSL
          ? { ssl: { require: true, rejectUnauthorized: false } }
          : { ssl: false },
      }
    );

const User = require("./user")(sequelize);

module.exports = {
  sequelize,
  User,
};
