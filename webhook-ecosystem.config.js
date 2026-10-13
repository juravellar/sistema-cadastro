// WEBHOOK_SECRET deve vir do ambiente do servidor (ex.: export no shell do PM2
// ou `pm2 start webhook-ecosystem.config.js --update-env`), nunca deste arquivo.
module.exports = {
  apps: [
    {
      name: "webhook-server",
      script: "./webhook-server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        WEBHOOK_PORT: 3003,
      },
      error_file: "./logs/webhook-err.log",
      out_file: "./logs/webhook-out.log",
      log_file: "./logs/webhook-combined.log",
      time: true,
      watch: false,
      max_memory_restart: "256M",
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: "10s",
      listen_timeout: 8000,
      kill_timeout: 5000,
    },
  ],
};
