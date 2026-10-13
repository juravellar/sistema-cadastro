const { DataTypes } = require("sequelize");
const { normalizeEmail } = require("../lib/validation");

const ROLES = Object.freeze({ USER: "user", ADMIN: "admin" });

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(200),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
        set(value) {
          this.setDataValue("email", normalizeEmail(value));
        },
      },
      role: {
        type: DataTypes.ENUM(ROLES.USER, ROLES.ADMIN),
        allowNull: false,
        defaultValue: ROLES.USER,
      },
      passwordChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "users",
      timestamps: true,
      hooks: {
        // Sessões abertas antes desta data são encerradas (middlewares/auth.js).
        beforeSave(user) {
          if (!user.isNewRecord && user.changed("password")) {
            user.passwordChangedAt = new Date();
          }
        },
      },
    }
  );

  User.ROLES = ROLES;

  User.prototype.toSessionUser = function () {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
    };
  };

  return User;
};
