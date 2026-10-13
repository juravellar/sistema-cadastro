#!/usr/bin/env node

const { sequelize, User } = require("../models");
const userService = require("../services/user-service");
const { normalizeEmail, validateEmail, validatePassword } = require("../lib/validation");

async function promote(user, password) {
  user.role = User.ROLES.ADMIN;
  if (password) {
    const passwordError = validatePassword(password);
    if (passwordError) throw new Error(`ADMIN_PASSWORD: ${passwordError}`);
    user.password = await userService.hashPassword(password);
  }
  await user.save();
}

async function createAdmin() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME = "admin" } = process.env;

  if (!ADMIN_EMAIL) {
    throw new Error("Defina ADMIN_EMAIL (e ADMIN_PASSWORD para criar um novo usuário).");
  }
  const emailError = validateEmail(normalizeEmail(ADMIN_EMAIL));
  if (emailError) throw new Error(`ADMIN_EMAIL: ${emailError}`);

  const existing = await User.findOne({ where: { email: normalizeEmail(ADMIN_EMAIL) } });
  if (existing) {
    await promote(existing, ADMIN_PASSWORD);
    console.log(`✅ Usuário ${ADMIN_EMAIL} promovido a admin`);
    return;
  }

  await userService.createUser({
    username: ADMIN_USERNAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
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
