module.exports = {
  apps: [
    {
      name: "webhook-server",
      script: "./webhook-server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        WEBHOOK_PORT: 3002,
        WEBHOOK_SECRET: "seu-secret-muito-forte-aqui",
      },
      error_file: "./logs/webhook-err.log",
      out_file: "./logs/webhook-out.log",
      log_file: "./logs/webhook-combined.log",
      time: true,
      watch: false,
      max_memory_restart: "512M",
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: "10s",
      // Reiniciar apenas se houver mudanças no código
      ignore_watch: ["node_modules", "logs", "*.log"],
      // Configurações de rede
      listen_timeout: 8000,
      kill_timeout: 5000,
    },
  ],
};

