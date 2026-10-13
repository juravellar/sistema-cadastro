const { DataTypes } = require("sequelize");

// Nenhum usuário existente é promovido: antes desta migration qualquer e-mail
// contendo "@admin" virava admin, então não há como distinguir admins legítimos.
// Promova explicitamente com `npm run create-admin`.
async function up({ context: queryInterface }) {
  const columns = await queryInterface.describeTable("users");
  if (columns.role) return;

  await queryInterface.addColumn("users", "role", {
    type: DataTypes.ENUM("user", "admin"),
    allowNull: false,
    defaultValue: "user",
  });
}

async function down({ context: queryInterface }) {
  await queryInterface.removeColumn("users", "role");
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
}

module.exports = { up, down };
