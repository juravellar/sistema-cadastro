const express = require("express");
const { exec } = require("child_process");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3002;

// Middleware para parsing JSON
app.use(express.json());

// Secret para verificar webhooks (configure no GitHub)
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "seu-secret-aqui";

// Função para verificar assinatura do webhook
function verifySignature(payload, signature) {
  const expectedSignature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  return signature === `sha256=${expectedSignature}`;
}

// Endpoint para receber webhooks do GitHub
app.post("/webhook/deploy", (req, res) => {
  console.log("📥 Webhook recebido:", new Date().toISOString());

  const signature = req.headers["x-hub-signature-256"];
  const payload = JSON.stringify(req.body);

  // Verificar assinatura (opcional, mas recomendado)
  if (
    WEBHOOK_SECRET !== "seu-secret-aqui" &&
    !verifySignature(payload, signature)
  ) {
    console.log("❌ Assinatura inválida");
    return res.status(401).send("Unauthorized");
  }

  // Verificar se é um push para a branch main
  const { ref, commits } = req.body;
  if (ref !== "refs/heads/main" && ref !== "refs/heads/master") {
    console.log("⏭️ Push não é para main/master, ignorando");
    return res.status(200).send("Not main branch");
  }

  console.log("🚀 Iniciando deploy automático...");

  // Executar script de deploy
  const deployScript = path.join(__dirname, "scripts", "git-deploy.sh");

  exec(`bash ${deployScript}`, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Erro no deploy:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
        stderr: stderr,
      });
    }

    console.log("✅ Deploy executado com sucesso!");
    console.log("📋 Output:", stdout);

    res.status(200).json({
      success: true,
      message: "Deploy successful",
      output: stdout,
    });
  });
});

// Endpoint de health check
app.get("/webhook/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Endpoint para deploy manual
app.post("/webhook/deploy-manual", (req, res) => {
  console.log("🔧 Deploy manual solicitado:", new Date().toISOString());

  const deployScript = path.join(__dirname, "scripts", "git-deploy.sh");

  exec(`bash ${deployScript}`, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Erro no deploy manual:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
        stderr: stderr,
      });
    }

    console.log("✅ Deploy manual executado com sucesso!");

    res.status(200).json({
      success: true,
      message: "Manual deploy successful",
      output: stdout,
    });
  });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error("❌ Erro no servidor webhook:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor webhook rodando na porta ${PORT}`);
  console.log(`📡 Endpoints disponíveis:`);
  console.log(`   - POST /webhook/deploy (webhook do GitHub)`);
  console.log(`   - POST /webhook/deploy-manual (deploy manual)`);
  console.log(`   - GET /webhook/health (health check)`);
  console.log(
    `🔐 Secret configurado: ${
      WEBHOOK_SECRET !== "seu-secret-aqui"
        ? "Sim"
        : "Não (configure WEBHOOK_SECRET)"
    }`
  );
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Recebido SIGTERM, encerrando servidor webhook...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Recebido SIGINT, encerrando servidor webhook...");
  process.exit(0);
});

