/**
 * Long-polling relay: getUpdates via TELEGRAM_PROXY_URL → local Next webhook.
 *
 * Use when Telegram cannot reach the server inbound (webhook → Connection timed out).
 * Production: run under pm2 with TELEGRAM_MODE=polling in .env.local
 *   pm2 start scripts/telegram-poll.js --name devfuture-tg-poll --cwd /var/www/devfuture
 * Local: npm run tg:poll
 *
 * Do not run poll + webhook at the same time — this script removes the webhook.
 */

const https = require("https");
const { loadEnvFiles } = require("./telegram-cli-shared");

function proxyAgent() {
  const raw = process.env.TELEGRAM_PROXY_URL?.trim();
  if (!raw) return undefined;
  if (/^socks/i.test(raw)) {
    const { SocksProxyAgent } = require("socks-proxy-agent");
    return new SocksProxyAgent(raw.replace(/^socks5:\/\//i, "socks5h://"));
  }
  const { HttpsProxyAgent } = require("https-proxy-agent");
  return new HttpsProxyAgent(raw);
}

function api(token, method, body, timeoutMs) {
  const payload = JSON.stringify(body || {});
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.telegram.org",
        path: `/bot${token}/${method}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
        agent: proxyAgent(),
        timeout: timeoutMs,
      },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(d));
          } catch {
            reject(new Error(`Non-JSON ${res.statusCode}: ${d.slice(0, 120)}`));
          }
        });
      }
    );
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", reject);
    req.end(payload);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  loadEnvFiles();
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    console.error("Нет TELEGRAM_BOT_TOKEN в .env.local");
    process.exit(1);
  }
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const localWebhook =
    process.env.TG_LOCAL_WEBHOOK || "http://127.0.0.1:3000/api/telegram/webhook";

  for (;;) {
    try {
      const r = await api(token, "deleteWebhook", { drop_pending_updates: false }, 20_000);
      if (r.ok) break;
      console.error("deleteWebhook:", r.description);
    } catch (err) {
      console.error("deleteWebhook network:", err.message);
    }
    await sleep(5000);
  }
  console.log(`[tg-poll] webhook removed, polling → ${localWebhook}`);

  let offset = 0;
  for (;;) {
    let data;
    try {
      data = await api(
        token,
        "getUpdates",
        { offset, timeout: 30, allowed_updates: ["message", "callback_query"] },
        45_000
      );
    } catch (err) {
      console.error("[tg-poll] getUpdates network:", err.message);
      await sleep(5000);
      continue;
    }

    if (!data.ok) {
      console.error("[tg-poll] getUpdates:", data.description);
      await sleep(5000);
      continue;
    }

    for (const update of data.result || []) {
      // Keep offset on the failed update so getUpdates redelivers it (app restarting)
      try {
        const res = await fetch(localWebhook, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(secret ? { "X-Telegram-Bot-Api-Secret-Token": secret } : {}),
          },
          body: JSON.stringify(update),
        });
        if (res.status >= 500 || res.status === 429) {
          console.error("[tg-poll] local webhook HTTP", res.status, "— retry");
          await sleep(3000);
          break;
        }
        if (!res.ok) console.error("[tg-poll] local webhook HTTP", res.status);
      } catch (err) {
        console.error("[tg-poll] local webhook unreachable:", err.message, "— retry");
        await sleep(3000);
        break;
      }
      offset = update.update_id + 1;
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
