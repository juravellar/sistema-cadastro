#!/usr/bin/env node

const { Sequelize } = require("sequelize");
const { config } = require("../config");

async function createDatabase() {
  const { host, port, user, password, database } = config.db;

  const adminSequelize = new Sequelize("postgres", user, password, {
    host,
    port,
    dialect: "postgres",
    logging: false,
  });

  try {
    const [results] = await adminSequelize.query("SELECT 1 FROM pg_database WHERE datname = $1", {
      bind: [database],
    });

    if (results.length === 0) {
      const identifier = adminSequelize.getQueryInterface().quoteIdentifier(database);
      await adminSequelize.query(`CREATE DATABASE ${identifier}`);
      console.log(`✅ Banco '${database}' criado`);
    }
  } finally {
    await adminSequelize.close();
  }
}

if (require.main === module) {
  createDatabase().catch((error) => {
    console.error("❌ Erro ao criar banco:", error.message);
    process.exit(1);
  });
}

module.exports = createDatabase;
