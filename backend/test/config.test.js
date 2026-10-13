const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("child_process");
const path = require("path");

// config.js lê o ambiente na importação; cada cenário roda num processo novo.
function loadConfig(env, expression) {
  const script = `const c = require("./config"); console.log(JSON.stringify(${expression}));`;
  const output = execFileSync(process.execPath, ["-e", script], {
    cwd: path.join(__dirname, ".."),
    env: { PATH: process.env.PATH, DOTENV_CONFIG_QUIET: "true", ...env },
    encoding: "utf8",
  });
  return JSON.parse(output.trim().split("\n").pop());
}

describe("config", () => {
  it("NODE_ENV ausente não liga o modo de desenvolvimento", () => {
    assert.equal(loadConfig({}, "c.config.isDevelopment"), false);
  });

  it("só NODE_ENV=development liga o modo de desenvolvimento", () => {
    assert.equal(loadConfig({ NODE_ENV: "development" }, "c.config.isDevelopment"), true);
  });

  for (const [value, expected] of [
    ["0", false],
    ["FALSE", false],
    ["no", false],
    ["1", true],
    ["True", true],
    ["yes", true],
  ]) {
    it(`COOKIE_SECURE=${value} vira ${expected}`, () => {
      const server = loadConfig({ COOKIE_SECURE: value }, "c.serverConfig()");
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
    assert.throws(
      () => loadConfig({ COOKIE_SECURE: "talvez" }, "c.serverConfig()"),
      /COOKIE_SECURE/
    );
    assert.throws(() => loadConfig({ PORT: "abc" }, "c.serverConfig()"), /PORT/);
  });
});
