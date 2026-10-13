const express = require("express");
const { execFile } = require("child_process");
const crypto = require("crypto");
const path = require("path");

const DEPLOY_SCRIPT = path.join(__dirname, "scripts", "deploy-aapanel.sh");
const DEPLOY_TIMEOUT_MS = 10 * 60 * 1000;

function isValidSignature(secret, rawBody, signatureHeader) {
  if (typeof signatureHeader !== "string" || !rawBody) return false;
  const expected = Buffer.from(
    `sha256=${crypto.createHmac("sha256", secret).update(rawBody).digest("hex")}`
  );
  const received = Buffer.from(signatureHeader);
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

function runDeployScript(done) {
  execFile("bash", [DEPLOY_SCRIPT], { timeout: DEPLOY_TIMEOUT_MS }, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Erro no deploy:", error.message, stderr);
    } else {
      console.log("✅ Deploy concluído\n", stdout);
    }
    done();
  });
}

function createWebhookApp({
  secret,
  runDeploy = runDeployScript,
  deployBranches = ["refs/heads/main"],
}) {
  if (!secret) throw new Error("WEBHOOK_SECRET é obrigatório");

  const branches = new Set(deployBranches);
  let deployInProgress = false;

  const app = express();
  app.disable("x-powered-by");

  // O GitHub assina os bytes exatos do corpo, e re-serializar o JSON
  // gera outra string que invalida o HMAC.
  app.use(
    express.json({
      limit: "1mb",
      verify: (req, res, buf) => {
        req.rawBody = buf;
      },
    })
  );

  app.post("/webhook/deploy", (req, res) => {
    if (!isValidSignature(secret, req.rawBody, req.headers["x-hub-signature-256"])) {
      console.warn("❌ Assinatura inválida");
      return res.status(401).json({ success: false });
    }

    if (req.headers["x-github-event"] === "ping") {
      return res.status(200).json({ success: true, message: "pong" });
    }

    if (!branches.has(req.body.ref)) {
      return res.status(200).json({ success: true, message: "Branch ignorada" });
    }

    if (deployInProgress) {
      return res.status(409).json({ success: false, message: "Deploy já em andamento" });
    }

    // GitHub encerra a entrega após 10s; o deploy roda em background.
    deployInProgress = true;
    runDeploy(() => {
      deployInProgress = false;
    });
    res.status(202).json({ success: true, message: "Deploy iniciado" });
  });

  app.get("/webhook/health", (req, res) => {
    res.json({ status: "healthy", deployInProgress });
  });

  app.use((err, req, res, next) => {
    console.error("❌ Erro no servidor webhook:", err.message);
    res.status(err.status || 500).json({ success: false });
  });

  return app;
}

if (require.main === module) {
  const port = Number(process.env.WEBHOOK_PORT) || 3003;
  if (!process.env.WEBHOOK_SECRET) {
    console.error(
      "❌ WEBHOOK_SECRET não definido. Recusando iniciar sem verificação de assinatura."
    );
    process.exit(1);
  }
  createWebhookApp({ secret: process.env.WEBHOOK_SECRET }).listen(port, () => {
    console.log(`🚀 Webhook ouvindo na porta ${port}`);
  });
}

module.exports = { createWebhookApp, isValidSignature };
