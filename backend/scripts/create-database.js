#!/usr/bin/env node

require("dotenv").config();
const { Sequelize } = require("sequelize");

const {
  PGHOST = "postgres",
  PGPORT = 5432,
  PGUSER = "postgres",
  PGPASSWORD = "postgres",
  PGDATABASE = "sistema_cadastro",
} = process.env;

async function createDatabase() {
  console.log("🔍 Database Creation Debug:");
  console.log("PGHOST:", PGHOST);
  console.log("PGPORT:", PGPORT);
  console.log("PGUSER:", PGUSER);
  console.log("PGDATABASE:", PGDATABASE);

  const adminSequelize = new Sequelize("postgres", PGUSER, PGPASSWORD, {
    host: PGHOST,
    port: PGPORT,
    dialect: "postgres",
    logging: false,
  });

  try {
    console.log("🔄 Conectando ao PostgreSQL...");
    await adminSequelize.authenticate();
    console.log("✅ Conectado ao PostgreSQL");

    const [results] = await adminSequelize.query(
      `SELECT 1 FROM pg_database WHERE datname = '${PGDATABASE}'`
    );

    if (results.length > 0) {
      console.log(`ℹ️  Banco '${PGDATABASE}' já existe`);
    } else {
      console.log(`🔄 Criando banco '${PGDATABASE}'...`);
      await adminSequelize.query(`CREATE DATABASE "${PGDATABASE}"`);
      console.log(`✅ Banco '${PGDATABASE}' criado com sucesso!`);
    }
  } catch (error) {
    console.error("❌ Erro ao criar banco:", error.message);
    process.exit(1);
  } finally {
    await adminSequelize.close();
  }
}

if (require.main === module) createDatabase();

module.exports = createDatabase;
