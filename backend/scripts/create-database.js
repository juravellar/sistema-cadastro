#!/usr/bin/env node

/**
 * Script para criar o banco de dados automaticamente
 * Conecta ao PostgreSQL e cria o banco se não existir
 */

require("dotenv").config();
const { Sequelize } = require("sequelize");

const {
  DATABASE_URL,
  PGHOST = "localhost",
  PGPORT = 5432,
  PGUSER = "postgres",
  PGPASSWORD = "0000",
  PGDATABASE = "sistema-cadastro",
} = process.env;

async function createDatabase() {
  if (DATABASE_URL) {
    console.log("ℹ️  Usando DATABASE_URL - pulando criação de banco");
    return;
  }

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
    console.error(
      "💡 Verifique se o PostgreSQL está rodando e as credenciais estão corretas"
    );
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  } finally {
    await adminSequelize.close();
  }
}

if (require.main === module) {
  createDatabase();
}

module.exports = createDatabase;
