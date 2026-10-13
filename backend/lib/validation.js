const { ValidationError } = require("./errors");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LENGTH = 200;
const MIN_PASSWORD_LENGTH = 8;
// bcrypt ignora silenciosamente tudo além de 72 bytes.
const MAX_PASSWORD_BYTES = 72;

const ROLES = ["user", "admin"];

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : email;
}

function validateRole(role) {
  return ROLES.includes(role) ? null : `Perfil inválido. Use: ${ROLES.join(", ")}`;
}

function validateEmail(email) {
  if (typeof email !== "string" || !email.trim()) return "Email é obrigatório";
  if (email.length > MAX_FIELD_LENGTH || !EMAIL_RE.test(email)) return "Email inválido";
  return null;
}

function validatePassword(password) {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`;
  }
  if (Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES) {
    return `A senha deve ter no máximo ${MAX_PASSWORD_BYTES} bytes`;
  }
  return null;
}

function validateUsername(username) {
  if (typeof username !== "string" || !username.trim()) return "Usuário é obrigatório";
  if (username.length > MAX_FIELD_LENGTH) {
    return `Usuário deve ter no máximo ${MAX_FIELD_LENGTH} caracteres`;
  }
  return null;
}

function firstError(...errors) {
  return errors.find(Boolean) || null;
}

function assertValid(...errors) {
  const error = firstError(...errors);
  if (error) throw new ValidationError(error);
}

function parseId(raw) {
  return /^\d+$/.test(raw) ? Number(raw) : null;
}

module.exports = {
  normalizeEmail,
  validateRole,
  validateEmail,
  validatePassword,
  validateUsername,
  firstError,
  assertValid,
  parseId,
};
