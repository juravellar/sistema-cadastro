module.exports = {
  apps: [
    {
      name: "sistema-cadastro-backend",
      script: "./bin/www",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
      error_file: "./logs/backend-err.log",
      out_file: "./logs/backend-out.log",
      log_file: "./logs/backend-combined.log",
      time: true,
      watch: false,
      max_memory_restart: "512M",
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: "10s",
      ignore_watch: ["node_modules", "logs", "*.log"],
      listen_timeout: 8000,
      kill_timeout: 5000,
    },
  ],
};
