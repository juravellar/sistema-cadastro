#!/usr/bin/env node

/**
 * Script para inicializar o banco de dados
 * Este script pode ser executado independentemente para configurar o banco
 */

require("dotenv").config();
const { sequelize, User } = require("../models");
const bcrypt = require("bcrypt");
const createDatabase = require("./create-database");

async function initializeDatabase() {
  try {
    console.log("🔄 Iniciando configuração do banco de dados...");

    await createDatabase();

    await sequelize.authenticate();
    console.log("✅ Conexão com o banco estabelecida");

    await sequelize.sync({
      force: process.argv.includes("--force"),
      alter: process.argv.includes("--alter"),
    });
    console.log("✅ Tabelas sincronizadas");

    const adminExists = await User.findOne({
      where: { email: "admin@admin.com" },
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin", 10);
      await User.create({
        username: "admin",
        email: "admin@admin.com",
        password: hashedPassword,
      });
      console.log("✅ Usuário admin criado: admin@admin.com / admin");
    } else {
      console.log("ℹ️  Usuário admin já existe");
    }

    console.log("🎉 Banco de dados configurado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao configurar o banco:", error.message);
    console.error(
      "💡 Verifique se o PostgreSQL está rodando e as credenciais estão corretas"
    );
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
