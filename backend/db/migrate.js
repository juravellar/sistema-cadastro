#!/usr/bin/env node

const path = require("path");
const { Umzug, SequelizeStorage } = require("umzug");
const { sequelize } = require("../models");
const { config } = require("../config");
const createDatabase = require("../scripts/create-database");

function createMigrator() {
  return new Umzug({
    migrations: { glob: path.join(__dirname, "migrations", "*.js") },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: config.isTest ? undefined : console,
  });
}

async function migrate() {
  await createDatabase();
  await createMigrator().up();
}

if (require.main === module) {
  const direction = process.argv[2] === "down" ? "down" : "up";
  createDatabase()
    .then(() => createMigrator()[direction]())
    .then(() => sequelize.close())
    .catch(async (err) => {
      console.error("❌ Falha na migration:", err.message);
      await sequelize.close();
      process.exit(1);
    });
}

module.exports = { migrate, createMigrator };
