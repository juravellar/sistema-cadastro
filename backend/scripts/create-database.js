#!/usr/bin/env node

require("dotenv").config();
const { Sequelize } = require("sequelize");

async function createDatabase() {
  const {
    PGHOST = "postgres",
    PGPORT = 5432,
    PGUSER = "postgres",
    PGPASSWORD = "postgres",
    PGDATABASE = "sistema_cadastro",
  } = process.env;

  const adminSequelize = new Sequelize("postgres", PGUSER, PGPASSWORD, {
    host: PGHOST,
    port: PGPORT,
    dialect: "postgres",
    logging: false,
  });

  try {
    const [results] = await adminSequelize.query("SELECT 1 FROM pg_database WHERE datname = $1", {
      bind: [PGDATABASE],
    });

    if (results.length === 0) {
      const identifier = adminSequelize.getQueryInterface().quoteIdentifier(PGDATABASE);
      await adminSequelize.query(`CREATE DATABASE ${identifier}`);
      console.log(`✅ Banco '${PGDATABASE}' criado`);
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
