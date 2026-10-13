#!/usr/bin/env node

require("dotenv").config();
const bcrypt = require("bcrypt");
const { sequelize, User } = require("../models");
const { validatePassword, validateEmail, normalizeEmail } = require("../lib/validation");

async function createAdmin() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME = "admin" } = process.env;

  if (!ADMIN_EMAIL) {
    throw new Error("Defina ADMIN_EMAIL (e ADMIN_PASSWORD para criar um novo usuário).");
  }
  const emailError = validateEmail(ADMIN_EMAIL);
  if (emailError) throw new Error(`ADMIN_EMAIL: ${emailError}`);

  const existing = await User.findOne({ where: { email: normalizeEmail(ADMIN_EMAIL) } });

  if (existing) {
    existing.role = User.ROLES.ADMIN;
    if (ADMIN_PASSWORD) {
      const passwordError = validatePassword(ADMIN_PASSWORD);
      if (passwordError) throw new Error(`ADMIN_PASSWORD: ${passwordError}`);
      existing.password = await bcrypt.hash(ADMIN_PASSWORD, 10);
    }
    await existing.save();
    console.log(`✅ Usuário ${ADMIN_EMAIL} promovido a admin`);
    return;
  }

  const passwordError = validatePassword(ADMIN_PASSWORD);
  if (passwordError) throw new Error(`ADMIN_PASSWORD: ${passwordError}`);

  await User.create({
    username: ADMIN_USERNAME,
    email: ADMIN_EMAIL,
    password: await bcrypt.hash(ADMIN_PASSWORD, 10),
    role: User.ROLES.ADMIN,
  });
  console.log(`✅ Admin ${ADMIN_EMAIL} criado`);
}

createAdmin()
  .catch((err) => {
    console.error("❌", err.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
