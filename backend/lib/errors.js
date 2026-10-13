class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.name = new.target.name;
    this.status = status;
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class AuthenticationError extends AppError {
  constructor(message = "Usuário não autenticado") {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Apenas administradores podem acessar este recurso") {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409);
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
};
