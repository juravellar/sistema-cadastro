export const AUTH_CHANGED_EVENT = "auth:changed";

// 401/403 numa chamada comum significa que a sessão foi encerrada ou o perfil
// mudou no servidor (logout em outro lugar, rebaixamento, exclusão). O
// AuthContext escuta o evento e revalida a sessão. As chamadas de autenticação
// passam notifyAuthChange: false para não entrar em loop.
async function request(method, url, body, { notifyAuthChange = true } = {}) {
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

const silent = { notifyAuthChange: false };

export const api = {
  auth: {
    signup: (values) => request("POST", "/api/auth/signup", values, silent),
    login: (credentials) => request("POST", "/api/auth/login", credentials, silent),
    logout: () => request("POST", "/api/auth/logout", undefined, silent),
  },
  me: {
    get: () => request("GET", "/api/me", undefined, silent),
    update: (values) => request("PATCH", "/api/me", values),
    changePassword: (values) => request("PUT", "/api/me/password", values),
  },
  users: {
    list: ({ limit, offset }) =>
      request("GET", `/api/users?${new URLSearchParams({ limit, offset })}`),
    create: (values) => request("POST", "/api/users", values),
    update: (id, values) => request("PUT", `/api/users/${id}`, values),
    remove: (id) => request("DELETE", `/api/users/${id}`),
  },
};
