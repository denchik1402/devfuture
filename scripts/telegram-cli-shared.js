/**
 * Shared helpers for Telegram CLI scripts (check / set-webhook).
 */
const fs = require("fs");
const path = require("path");
const dns = require("dns");
const { execFileSync } = require("child_process");

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  /* ignore */
}

function loadEnvFiles() {
  for (const name of [".env.local", ".env"]) {
    const envPath = path.join(process.cwd(), name);
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

function apiBase() {
  return (process.env.TELEGRAM_API_BASE || "https://api.telegram.org").replace(
    /\/$/,
    ""
  );
}

/**
 * Prefer curl -4 (IPv4): Node fetch often hangs on broken IPv6 to Telegram from VPS.
 */
function curlJson(url, { method = "GET", body } = {}) {
  const args = [
    "-4",
    "-sS",
    "--max-time",
    "25",
    "-H",
    "Content-Type: application/json",
    url,
  ];
  if (method === "POST") {
    args.push("-X", "POST", "-d", body || "{}");
  }
  try {
    const out = execFileSync("curl", args, {
      encoding: "utf8",
      maxBuffer: 2 * 1024 * 1024,
    });
    return JSON.parse(out);
  } catch (e) {
    const msg = e.stderr || e.message || String(e);
    throw new Error(`curl failed: ${msg}`);
  }
}

async function tgGet(pathSuffix) {
  const url = `${apiBase()}${pathSuffix}`;
  try {
    return curlJson(url);
  } catch (curlErr) {
    const res = await fetch(url, { signal: AbortSignal.timeout(25_000) });
    return res.json();
  }
}

async function tgPost(pathSuffix, body) {
  const url = `${apiBase()}${pathSuffix}`;
  const payload = JSON.stringify(body);
  try {
    return curlJson(url, { method: "POST", body: payload });
  } catch (curlErr) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      signal: AbortSignal.timeout(25_000),
    });
    return res.json();
  }
}

module.exports = { loadEnvFiles, apiBase, tgGet, tgPost };
