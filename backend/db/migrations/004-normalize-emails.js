// Mesclar contas automaticamente poderia entregar os dados de uma pessoa a
// outra, então duplicatas que só diferem em maiúsculas abortam a migration
// para resolução manual.
async function up({ context: queryInterface }) {
  const [duplicates] = await queryInterface.sequelize.query(`
    SELECT lower(trim(email)) AS email, array_agg(id ORDER BY id) AS ids
    FROM users
    GROUP BY lower(trim(email))
    HAVING count(*) > 1
  `);

  if (duplicates.length > 0) {
    const list = duplicates.map((d) => `${d.email} (ids ${d.ids.join(", ")})`).join("; ");
    throw new Error(
      `E-mails duplicados ignorando maiúsculas/minúsculas. Exclua ou altere as contas extras e rode a migration de novo: ${list}`
    );
  }

  await queryInterface.sequelize.query(
    "UPDATE users SET email = lower(trim(email)) WHERE email <> lower(trim(email))"
  );
}

// A grafia original não é preservada, então não há como desfazer.
async function down() {}

module.exports = { up, down };
