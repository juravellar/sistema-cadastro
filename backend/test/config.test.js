const { describe, it, after } = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "..", "config.js");
// Diretório vazio como cwd: o dotenv procura .env no cwd, e o backend/.env
// local de quem roda os testes não pode interferir nos cenários.
const EMPTY_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "config-test-"));

function loadConfig(env, expression) {
  const script = `const c = require(${JSON.stringify(CONFIG_PATH)}); console.log(JSON.stringify(${expression}));`;
  const output = execFileSync(process.execPath, ["-e", script], {
    cwd: EMPTY_DIR,
    env: { PATH: process.env.PATH, ...env },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return JSON.parse(output.trim().split("\n").pop());
}

describe("config", () => {
  const tempDirs = [EMPTY_DIR];
  after(() => tempDirs.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })));
  it("NODE_ENV ausente não liga o modo de desenvolvimento", () => {
    assert.equal(loadConfig({}, "c.config.isDevelopment"), false);
  });

  it("só NODE_ENV=development liga o modo de desenvolvimento", () => {
    assert.equal(loadConfig({ NODE_ENV: "development" }, "c.config.isDevelopment"), true);
  });

  it("sem NODE_ENV, o servidor exige SESSION_SECRET e explica como rodar localmente", () => {
    assert.throws(
      () => loadConfig({}, "c.serverConfig()"),
      /SESSION_SECRET[\s\S]*NODE_ENV=development/
    );
  });

  it("sem NODE_ENV, o cookie é Secure por padrão", () => {
    const server = loadConfig({ SESSION_SECRET: "s" }, "c.serverConfig()");
    assert.equal(server.secureCookie, true);
  });

  for (const nodeEnv of ["development", "test"]) {
    it(`NODE_ENV=${nodeEnv} usa o segredo local e cookie sem Secure`, () => {
      const server = loadConfig({ NODE_ENV: nodeEnv }, "c.serverConfig()");
      assert.equal(server.sessionSecret, "dev-only-session-secret");
      assert.equal(server.secureCookie, false);
    });
  }

  for (const [value, expected] of [
    ["0", false],
    ["FALSE", false],
    ["no", false],
    ["1", true],
    ["True", true],
    ["yes", true],
  ]) {
    it(`COOKIE_SECURE=${value} vira ${expected}`, () => {
      const server = loadConfig(
        { NODE_ENV: "development", COOKIE_SECURE: value },
        "c.serverConfig()"
      );
      assert.equal(server.secureCookie, expected);
    });
  }

  it("valores inválidos do servidor não impedem migrate e create-admin de carregar o config", () => {
    const db = loadConfig(
      { COOKIE_SECURE: "talvez", PORT: "abc", PGHOST: "db" },
      "c.config.db.host"
    );
    assert.equal(db, "db");
  });

  it("valores inválidos do servidor falham ao subir o servidor", () => {
    const base = { NODE_ENV: "development" };
    assert.throws(
      () => loadConfig({ ...base, COOKIE_SECURE: "talvez" }, "c.serverConfig()"),
      /COOKIE_SECURE/
    );
    assert.throws(() => loadConfig({ ...base, PORT: "abc" }, "c.serverConfig()"), /PORT/);
  });

  // O isolamento depende de o dotenv ler o .env do cwd: este teste prova isso
  // com um .env num diretório temporário, sem nunca tocar no backend/.env.
  it("lê o .env do diretório atual (base do isolamento dos outros cenários)", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "config-env-"));
    tempDirs.push(dir);
    fs.writeFileSync(path.join(dir, ".env"), "NODE_ENV=development\n");
    const script = `console.log(JSON.stringify(require(${JSON.stringify(CONFIG_PATH)}).config.isDevelopment))`;
    const output = execFileSync(process.execPath, ["-e", script], {
      cwd: dir,
      env: { PATH: process.env.PATH },
      encoding: "utf8",
    });
    assert.equal(JSON.parse(output.trim().split("\n").pop()), true);
  });

  it("sem NODE_ENV, todo o app se comporta como produção", () => {
    assert.equal(loadConfig({}, "c.config.isProduction"), true);
  });
});
