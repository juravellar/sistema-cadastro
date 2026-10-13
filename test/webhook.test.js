const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const request = require("supertest");
const { createWebhookApp } = require("../webhook-server");

const SECRET = "test-secret";

function sign(body, secret = SECRET) {
  return `sha256=${crypto.createHmac("sha256", secret).update(body).digest("hex")}`;
}

describe("webhook de deploy", () => {
  let deploys;
  let finishDeploy;
  let app;

  beforeEach(() => {
    deploys = 0;
    app = createWebhookApp({
      secret: SECRET,
      runDeploy: (done) => {
        deploys += 1;
        finishDeploy = done;
      },
    });
  });

  function push(payload, headers = {}) {
    const body = JSON.stringify(payload);
    return request(app)
      .post("/webhook/deploy")
      .set("content-type", "application/json")
      .set("x-hub-signature-256", sign(body))
      .set(headers)
      .send(body);
  }

  it("recusa iniciar sem segredo", () => {
    assert.throws(() => createWebhookApp({ secret: "" }), /WEBHOOK_SECRET/);
  });

  it("dispara deploy em push assinado para main", async () => {
    const res = await push({ ref: "refs/heads/main" });
    assert.equal(res.status, 202);
    assert.equal(deploys, 1);
  });

  it("valida a assinatura sobre os bytes exatos do corpo", async () => {
    const body = '{ "ref" :  "refs/heads/main" }';
    const res = await request(app)
      .post("/webhook/deploy")
      .set("content-type", "application/json")
      .set("x-hub-signature-256", sign(body))
      .send(body);
    assert.equal(res.status, 202);
  });

  for (const [caso, signature] of [
    ["sem assinatura", undefined],
    ["com assinatura de outro segredo", sign('{"ref":"refs/heads/main"}', "outro")],
    ["com assinatura malformada", "sha256=00"],
  ]) {
    it(`retorna 401 ${caso}`, async () => {
      const req = request(app).post("/webhook/deploy").set("content-type", "application/json");
      if (signature) req.set("x-hub-signature-256", signature);
      const res = await req.send('{"ref":"refs/heads/main"}');
      assert.equal(res.status, 401);
      assert.equal(deploys, 0);
    });
  }

  it("ignora outras branches", async () => {
    const res = await push({ ref: "refs/heads/feature-x" });
    assert.equal(res.status, 200);
    assert.equal(deploys, 0);
  });

  it("responde ping sem fazer deploy", async () => {
    const res = await push({ zen: "hi" }, { "x-github-event": "ping" });
    assert.equal(res.status, 200);
    assert.equal(deploys, 0);
  });

  it("não roda dois deploys ao mesmo tempo", async () => {
    assert.equal((await push({ ref: "refs/heads/main" })).status, 202);
    assert.equal((await push({ ref: "refs/heads/main" })).status, 409);

    finishDeploy();
    assert.equal((await push({ ref: "refs/heads/main" })).status, 202);
    assert.equal(deploys, 2);
  });

  it("não expõe o endpoint de deploy manual", async () => {
    const res = await request(app).post("/webhook/deploy-manual");
    assert.equal(res.status, 404);
  });
});
