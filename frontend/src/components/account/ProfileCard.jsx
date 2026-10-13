import Avatar from "./Avatar";

const ROLE_LABELS = { admin: "Administrador", user: "Usuário" };

function formatMemberSince(createdAt) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

function ProfileCard({ user }) {
  const memberSince = formatMemberSince(user.createdAt);

  return (
    <section className="soft-card profile-card text-center" aria-label="Seu perfil">
      <Avatar name={user.username} size="lg" />
      <h2 className="profile-name">{user.username}</h2>
      <p className="profile-email">{user.email}</p>
      <span className="role-badge">{ROLE_LABELS[user.role] || user.role}</span>

      {memberSince && (
        <dl className="profile-facts">
          <div>
            <dt>Membro desde</dt>
            <dd>{memberSince}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}

export default ProfileCard;
