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

const SESSION_COOKIE = "connect.sid";

function destroySession(req) {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => (err ? reject(err) : resolve()));
  });
}

async function logout(req, res) {
  await destroySession(req);
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  res.json({ success: true, message: "Logout realizado" });
}

module.exports = { SESSION_COOKIE, startSession, destroySession, logout };
