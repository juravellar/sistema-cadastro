const { DataTypes } = require("sequelize");

// Bancos já em produção tiveram a tabela criada pelo antigo sequelize.sync(),
// por isso a criação é condicional.
async function up({ context: queryInterface }) {
  const tables = await queryInterface.showAllTables();
  if (tables.includes("users")) return;

  await queryInterface.createTable("users", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING(200), allowNull: false },
    password: { type: DataTypes.STRING(200), allowNull: false },
    email: { type: DataTypes.STRING(200), allowNull: false, unique: true },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
  });
}

async function down({ context: queryInterface }) {
  await queryInterface.dropTable("users");
}

module.exports = { up, down };
