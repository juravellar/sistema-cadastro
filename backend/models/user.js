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
    },
    {
      tableName: "users",
      timestamps: true,
    }
  );

  User.ROLES = ROLES;

  User.prototype.toSessionUser = function () {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
    };
  };

  return User;
};
