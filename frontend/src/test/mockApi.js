import { vi } from "vitest";

export const ADMIN = { id: 1, username: "admin", email: "admin@example.com", role: "admin" };
export const USER = {
  id: 2,
  username: "maria",
  email: "maria@example.com",
  role: "user",
  createdAt: "2026-10-09T12:00:00.000Z",
};

function jsonResponse(status, body) {
  return { ok: status < 400, status, json: async () => body };
}

/**
 * Substitui fetch por um servidor falso. `routes` mapeia "MÉTODO /caminho"
 * (sem query string) para uma função (body, url) => [status, json].
 * Rotas não declaradas falham o teste, para não mascarar chamadas inesperadas.
 */
export function mockApi({ sessionUser = null, routes = {} } = {}) {
  let currentUser = sessionUser;

  const defaults = {
    "GET /api/user/profile": () =>
      currentUser ? [200, { success: true, user: currentUser }] : [401, { success: false }],
    "POST /api/logout": () => {
      currentUser = null;
      return [200, { success: true }];
    },
  };

  const fetchMock = vi.fn(async (url, options = {}) => {
    const method = options.method || "GET";
    const key = `${method} ${url.split("?")[0]}`;
    const handler = routes[key] || defaults[key];
    if (!handler) throw new Error(`Chamada não esperada: ${key}`);
    const body = options.body ? JSON.parse(options.body) : undefined;
    const [status, json] = handler(body, url);
    return jsonResponse(status, json);
  });

  fetchMock.setSessionUser = (user) => {
    currentUser = user;
  };

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

export function callsTo(fetchMock, method, path) {
  return fetchMock.mock.calls.filter(
    ([url, options = {}]) => (options.method || "GET") === method && url.split("?")[0] === path
  );
}
