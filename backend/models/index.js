const { Sequelize } = require("sequelize");
const { config } = require("../config");

const { host, port, user, password, database } = config.db;

const sequelize = new Sequelize(database, user, password, {
  host,
  port,
  dialect: "postgres",
  logging: false,
});

const User = require("./user")(sequelize);

module.exports = {
  sequelize,
  User,
};
