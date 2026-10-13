const { DataTypes } = require("sequelize");

async function up({ context: queryInterface }) {
  const columns = await queryInterface.describeTable("users");
  if (columns.passwordChangedAt) return;

  await queryInterface.addColumn("users", "passwordChangedAt", {
    type: DataTypes.DATE,
    allowNull: true,
  });
}

async function down({ context: queryInterface }) {
  await queryInterface.removeColumn("users", "passwordChangedAt");
}

module.exports = { up, down };
