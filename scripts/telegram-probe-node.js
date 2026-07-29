/**
 * Probe the same path Next.js uses for Bot API (Node https, IPv4 only).
 * Usage: node scripts/telegram-probe-node.js
 */
const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const { URL } = require("url");

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

function postJson(urlStr, headers, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const lib = url.protocol === "https:" ? https : http;
    const req = lib.request(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: "POST",
        headers: {
          ...headers,
          "content-length": Buffer.byteLength(body),
        },
        family: 4,
        servername: url.hostname,
        timeout: 25_000,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          let data;
          try {
            data = JSON.parse(raw);
          } catch {
            data = { ok: false, description: raw.slice(0, 200) };
          }
          resolve({ status: res.statusCode || 0, data });
        });
      }
    );
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  loadEnvFiles();
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const api = (
    process.env.TELEGRAM_API_BASE || "https://api.telegram.org"
  ).replace(/\/$/, "");
  const secret = process.env.TELEGRAM_PROXY_SECRET?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();

  console.log("api base:", api);
  console.log("proxy secret set:", Boolean(secret));
  console.log("webhook secret set:", Boolean(webhookSecret));
  console.log("chat id set:", Boolean(chatId));

  if (!token) {
    console.error("No TELEGRAM_BOT_TOKEN");
    process.exit(1);
  }

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (secret) headers["X-Telegram-Proxy-Secret"] = secret;

  console.log("\n1) Node https getMe (family=4)...");
  try {
    const r = await postJson(
      `${api}/bot${token}/getMe`,
      headers,
      JSON.stringify({})
    );
    console.log("   status", r.status, "ok=", r.data.ok, r.data.result?.username || r.data.description);
  } catch (e) {
    console.error("   FAIL:", e.message);
  }

  console.log("\n2) getWebhookInfo...");
  try {
    const r = await postJson(
      `${api}/bot${token}/getWebhookInfo`,
      headers,
      JSON.stringify({})
    );
    const info = r.data.result || {};
    console.log("   url:", info.url);
    console.log("   pending:", info.pending_update_count);
    console.log("   last_error_date:", info.last_error_date || "(none)");
    console.log("   last_error_message:", info.last_error_message || "(none)");
  } catch (e) {
    console.error("   FAIL:", e.message);
  }

  if (chatId) {
    console.log("\n3) sendMessage probe to TELEGRAM_CHAT_ID...");
    try {
      const r = await postJson(
        `${api}/bot${token}/sendMessage`,
        headers,
        JSON.stringify({
          chat_id: chatId,
          text: "DevFuture probe: Node→proxy OK",
        })
      );
      console.log("   status", r.status, "ok=", r.data.ok, r.data.description || "");
    } catch (e) {
      console.error("   FAIL:", e.message);
    }
  } else {
    console.log("\n3) skip sendMessage (no TELEGRAM_CHAT_ID)");
  }

  console.log("\n4) Local webhook POST /start simulation...");
  if (!webhookSecret || !chatId) {
    console.log("   skip (need TELEGRAM_WEBHOOK_SECRET + TELEGRAM_CHAT_ID)");
    return;
  }
  const payload = JSON.stringify({
    update_id: Date.now(),
    message: {
      message_id: 1,
      chat: { id: Number(chatId), type: "private" },
      text: "/start",
      from: { id: Number(chatId), first_name: "Probe" },
    },
  });
  try {
    const r = await postJson(
      "http://127.0.0.1:3000/api/telegram/webhook",
      {
        "Content-Type": "application/json",
        "x-telegram-bot-api-secret-token": webhookSecret,
      },
      payload
    );
    console.log("   webhook status", r.status, "body", JSON.stringify(r.data));
    console.log("   → check Telegram chat; also: pm2 logs devfuture --lines 20");
  } catch (e) {
    console.error("   FAIL:", e.message);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
