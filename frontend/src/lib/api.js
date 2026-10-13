export const AUTH_CHANGED_EVENT = "auth:changed";

// 401/403 numa chamada comum significa que a sessão foi encerrada ou o perfil
// mudou no servidor (logout em outro lugar, rebaixamento, exclusão). O
// AuthContext escuta o evento e revalida a sessão. As chamadas do próprio
// AuthContext passam notifyAuthChange: false para não entrar em loop.
export async function apiRequest(method, url, body, { notifyAuthChange = true } = {}) {
  const response = await fetch(url, {
    method,
    credentials: "include",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (notifyAuthChange && (response.status === 401 || response.status === 403)) {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}
