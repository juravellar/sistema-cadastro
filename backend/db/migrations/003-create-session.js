// Schema exigido pelo connect-pg-simple (node_modules/connect-pg-simple/table.sql).
async function up({ context: queryInterface }) {
  await queryInterface.sequelize.query(`
    CREATE TABLE IF NOT EXISTS "session" (
      "sid" varchar NOT NULL COLLATE "default" PRIMARY KEY,
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
  `);
}

async function down({ context: queryInterface }) {
  await queryInterface.dropTable("session");
}

module.exports = { up, down };
