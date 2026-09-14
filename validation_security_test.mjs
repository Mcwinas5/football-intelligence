// Security hardening test — fail-closed ADMIN_TOKEN + mock endpoint isolation.
// Self-contained: spawns its own server instances (ports 3101/3102). No external
// server required. See AGENTS.md.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url)); // repo root (this file lives at root level)
const tsxBin = path.join(root, "node_modules", ".bin", "tsx");
function assert(condition, message) { if (!condition) throw new Error(`FAIL: ${message}`); }

async function waitFor(url, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try { const r = await fetch(url); if (r.ok) return; } catch { /* not up yet */ }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Server did not become ready at ${url}`);
}
const start = (extraEnv) => spawn(tsxBin, ["server/index.ts"], { cwd: root, env: { ...process.env, ...extraEnv }, stdio: "ignore" });
const stop = (child) => { try { child.kill("SIGTERM"); } catch { /* already gone */ } };

// ---------------------------------------------------------------- instance 1:
// ADMIN_TOKEN missing → admin endpoints must FAIL CLOSED with an explicit error,
// while the public validation flow keeps working.
console.log("instance 1: ADMIN_TOKEN unset (expect fail-closed admin, working public flow)");
const envNoToken = { ...process.env, PORT: "3101" };
delete envNoToken.ADMIN_TOKEN;
const noToken = start(envNoToken);
try {
  await waitFor("http://127.0.0.1:3101/api/validation/mode");
  const mode = await (await fetch("http://127.0.0.1:3101/api/validation/mode")).json();
  assert(mode.admin_configured === false, "mode must report admin_configured=false when ADMIN_TOKEN is unset");

  for (const [method, url, body] of [
    ["GET", "/api/admin/metrics", undefined],
    ["GET", "/api/admin/predictions", undefined],
    ["POST", "/api/admin/predictions", {}],
    ["POST", "/api/admin/predictions/x/settle", {}],
  ]) {
    const r = await fetch("http://127.0.0.1:3101" + url, { method, headers: { "x-admin-token": "attacker-guess", "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const data = await r.json().catch(() => ({}));
    assert(r.status === 503, `${method} ${url} must fail closed with 503, got ${r.status}`);
    assert(typeof data.error === "string" && /ADMIN_TOKEN/i.test(data.error), `${url} must return an explicit ADMIN_TOKEN error`);
  }
  console.log("  admin endpoints disabled with explicit error (503) even with a guessed token");

  const prospect = await fetch("http://127.0.0.1:3101/api/validation/prospects", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Public Flow", phone_or_telegram: "@public", acquisition_source: "direct" }) });
  assert(prospect.ok, "public validation flow must keep working when admin is fail-closed");
  console.log("  public validation flow unaffected (prospects POST 200)");
} finally { stop(noToken); }

// ---------------------------------------------------------------- instance 2:
// NODE_ENV=production → mock payment/Telegram endpoints must be unavailable.
console.log("instance 2: NODE_ENV=production (expect mock endpoints disabled, admin token active)");
const prod = start({ PORT: "3102", NODE_ENV: "production", ADMIN_TOKEN: "prod-secret-token" });
try {
  await waitFor("http://127.0.0.1:3102/api/validation/mode");
  const mode = await (await fetch("http://127.0.0.1:3102/api/validation/mode")).json();
  assert(mode.mock_endpoints_enabled === false, "mode must report mock_endpoints_enabled=false in production");
  assert(mode.admin_configured === true, "mode must report admin_configured=true when ADMIN_TOKEN is set");

  for (const url of ["/api/validation/mock/payment", "/api/validation/mock/telegram"]) {
    const r = await fetch("http://127.0.0.1:3102" + url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prospect_id: "x" }) });
    const data = await r.json().catch(() => ({}));
    assert(r.status === 404, `${url} must be unavailable in production (404), got ${r.status}`);
    assert(/disabled/i.test(String(data.error)), `${url} must explain that mocks are disabled`);
  }
  console.log("  mock payment + mock telegram endpoints disabled with explicit error");

  const created = await fetch("http://127.0.0.1:3102/api/validation/prospects", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Prod Flow", phone_or_telegram: "@prod", acquisition_source: "direct" }) });
  assert(created.ok, "validation contract (prospect creation) must keep working in production mode");
  console.log("  validation contract unaffected (prospect creation 200)");

  const goodAdmin = await fetch("http://127.0.0.1:3102/api/admin/metrics", { headers: { "x-admin-token": "prod-secret-token" } });
  assert(goodAdmin.ok, "admin endpoints must work with the configured ADMIN_TOKEN");
  const badAdmin = await fetch("http://127.0.0.1:3102/api/admin/metrics", { headers: { "x-admin-token": "wrong" } });
  assert(badAdmin.status === 401, "admin endpoints must reject a wrong token with 401");
  console.log("  admin token accepted when correct, rejected with 401 when wrong");
} finally { stop(prod); }

console.log(JSON.stringify({ ok: true, test: "security_fail_closed_and_mock_isolation", fail_closed_admin: true, mock_endpoints_isolated: true }, null, 2));
