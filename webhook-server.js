const express = require("express");
const { execFile } = require("child_process");
const crypto = require("crypto");
const path = require("path");

const PORT = Number(process.env.WEBHOOK_PORT) || 3003;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const DEPLOY_SCRIPT = path.join(__dirname, "scripts", "deploy-aapanel.sh");
const DEPLOY_BRANCHES = new Set(["refs/heads/main"]);

if (!WEBHOOK_SECRET) {
  console.error("❌ WEBHOOK_SECRET não definido. Recusando iniciar sem verificação de assinatura.");
  process.exit(1);
}

function isValidSignature(rawBody, signatureHeader) {
  if (typeof signatureHeader !== "string" || !rawBody) return false;
  const expected = Buffer.from(
    `sha256=${crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex")}`
  );
  const received = Buffer.from(signatureHeader);
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

let deployInProgress = false;

function runDeploy() {
  deployInProgress = true;
  execFile("bash", [DEPLOY_SCRIPT], { timeout: 10 * 60 * 1000 }, (error, stdout, stderr) => {
    deployInProgress = false;
    if (error) {
      console.error("❌ Erro no deploy:", error.message, stderr);
      return;
    }
    console.log("✅ Deploy concluído\n", stdout);
  });
}

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
  if (!isValidSignature(req.rawBody, req.headers["x-hub-signature-256"])) {
    console.warn("❌ Assinatura inválida");
    return res.status(401).json({ success: false });
  }

  if (req.headers["x-github-event"] === "ping") {
    return res.status(200).json({ success: true, message: "pong" });
  }

  if (!DEPLOY_BRANCHES.has(req.body.ref)) {
    return res.status(200).json({ success: true, message: "Branch ignorada" });
  }

  if (deployInProgress) {
    return res.status(409).json({ success: false, message: "Deploy já em andamento" });
  }

  // GitHub encerra a entrega após 10s; o deploy roda em background.
  runDeploy();
  res.status(202).json({ success: true, message: "Deploy iniciado" });
});

app.get("/webhook/health", (req, res) => {
  res.json({ status: "healthy", deployInProgress });
});

app.use((err, req, res, next) => {
  console.error("❌ Erro no servidor webhook:", err.message);
  res.status(err.status || 500).json({ success: false });
});

app.listen(PORT, () => {
  console.log(`🚀 Webhook ouvindo na porta ${PORT}`);
});
