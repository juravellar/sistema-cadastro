import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente do arquivo .env
  const env = loadEnv(mode, process.cwd(), "");

  const backendUrl = env.VITE_BACKEND_URL || "http://localhost:3002";
  const port = env.VITE_PORT ? Number(env.VITE_PORT) : 5173;

  return {
    plugins: [react()],
    server: {
      port: port,
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          cookieDomainRewrite: "localhost",
          cookiePathRewrite: "/",
          configure: (proxy, _options) => {
            proxy.on("proxyReq", (proxyReq, req, _res) => {
              // Garante que cookies sejam enviados
              if (req.headers.cookie) {
                proxyReq.setHeader("cookie", req.headers.cookie);
              }
            });
            proxy.on("proxyRes", (proxyRes, req, res) => {
              // Garante que cookies sejam repassados corretamente
              if (proxyRes.headers["set-cookie"]) {
                console.log(
                  "🔵 Proxy recebeu cookies do backend:",
                  proxyRes.headers["set-cookie"]
                );
                const cookies = proxyRes.headers["set-cookie"].map((cookie) => {
                  // Remove flags que podem causar problemas em desenvolvimento
                  const modified = cookie
                    .replace(/; secure/gi, "")
                    .replace(/; SameSite=None/gi, "; SameSite=Lax");
                  console.log("🟢 Cookie modificado:", modified);
                  return modified;
                });
                proxyRes.headers["set-cookie"] = cookies;
                console.log(
                  "✅ Cookies sendo enviados para o navegador:",
                  proxyRes.headers["set-cookie"]
                );
              } else {
                console.warn(
                  "⚠️ Nenhum cookie recebido do backend na resposta"
                );
              }
            });
            proxy.on("error", (err, req, res) => {
              console.error("Proxy error:", err.message);
            });
          },
        },
        "/logout": {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          cookieDomainRewrite: "localhost",
          cookiePathRewrite: "/",
          configure: (proxy, _options) => {
            proxy.on("proxyReq", (proxyReq, req, _res) => {
              if (req.headers.cookie) {
                proxyReq.setHeader("cookie", req.headers.cookie);
              }
            });
            proxy.on("proxyRes", (proxyRes, req, res) => {
              if (proxyRes.headers["set-cookie"]) {
                const cookies = proxyRes.headers["set-cookie"].map((cookie) => {
                  return cookie
                    .replace(/; secure/gi, "")
                    .replace(/; SameSite=None/gi, "; SameSite=Lax");
                });
                proxyRes.headers["set-cookie"] = cookies;
              }
            });
            proxy.on("error", (err, req, res) => {
              console.error("Proxy error:", err.message);
            });
          },
        },
      },
    },
  };
});
