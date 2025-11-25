import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  const backendUrl = "http://backend:3002"; // 🔥 Docker backend
  const port = 5173;

  return {
    plugins: [react()],
    server: {
      host: true,
      port: port,
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          cookieDomainRewrite: "localhost",
          cookiePathRewrite: "/",
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq, req) => {
              if (req.headers.cookie) {
                proxyReq.setHeader("cookie", req.headers.cookie);
              }
            });
            proxy.on("proxyRes", (proxyRes) => {
              if (proxyRes.headers["set-cookie"]) {
                const cookies = proxyRes.headers["set-cookie"].map((cookie) =>
                  cookie
                    .replace(/; secure/gi, "")
                    .replace(/; SameSite=None/gi, "; SameSite=Lax")
                );
                proxyRes.headers["set-cookie"] = cookies;
              }
            });
          },
        },
        "/logout": {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          cookieDomainRewrite: "localhost",
          cookiePathRewrite: "/",
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq, req) => {
              if (req.headers.cookie) {
                proxyReq.setHeader("cookie", req.headers.cookie);
              }
            });
            proxy.on("proxyRes", (proxyRes) => {
              if (proxyRes.headers["set-cookie"]) {
                const cookies = proxyRes.headers["set-cookie"].map((cookie) =>
                  cookie
                    .replace(/; secure/gi, "")
                    .replace(/; SameSite=None/gi, "; SameSite=Lax")
                );
                proxyRes.headers["set-cookie"] = cookies;
              }
            });
          },
        },
      },
    },
  };
});
