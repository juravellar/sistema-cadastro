// Regenerar o ID da sessão ao autenticar evita session fixation. authAt é
// comparado com users.passwordChangedAt para encerrar sessões antigas.
function startSession(req, user) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.user = user.toSessionUser();
      req.session.authAt = Date.now();
      req.session.save((saveErr) => (saveErr ? reject(saveErr) : resolve()));
    });
  });
}

function destroySession(req) {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => (err ? reject(err) : resolve()));
  });
}

module.exports = { startSession, destroySession };
