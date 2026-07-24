/**
 * Local long-polling for the bot (when api.telegram.org is reachable).
 * Use this ONLY for local testing. On the server prefer webhook.
 *
 *   npm run tg:poll
 *
 * Stop with Ctrl+C. Do not run poll + webhook at the same time.
 */

const fs = require("fs");
const path = require("path");

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
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

async function api(token, method, body) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  return res.json();
}

async function main() {
  loadEnvLocal();
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    console.error("Нет TELEGRAM_BOT_TOKEN в .env.local");
    process.exit(1);
  }

  // Clear webhook so getUpdates works
  await api(token, "deleteWebhook", { drop_pending_updates: false });
  console.log("Webhook снят. Long polling… Пишите боту /start");
  console.log("Остановка: Ctrl+C\n");

  // Dynamic import of compiled bot is hard from plain node.
  // Call Next.js API by posting updates to local webhook instead if server runs —
  // but for standalone we inline minimal start reply here and forward to local server.

  const localWebhook =
    process.env.TG_LOCAL_WEBHOOK || "http://127.0.0.1:3000/api/telegram/webhook";

  let offset = 0;
  for (;;) {
    let data;
    try {
      data = await api(token, "getUpdates", {
        offset,
        timeout: 30,
        allowed_updates: ["message", "callback_query"],
      });
    } catch (err) {
      console.error("Сеть/Telegram API недоступны:", err.message || err);
      console.error("Нужен VPN или запуск на сервере с доступом к api.telegram.org");
      await new Promise((r) => setTimeout(r, 5000));
      continue;
    }

    if (!data.ok) {
      console.error(data);
      await new Promise((r) => setTimeout(r, 3000));
      continue;
    }

    for (const update of data.result || []) {
      offset = update.update_id + 1;
      try {
        const res = await fetch(localWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(update),
        });
        if (!res.ok) {
          console.error("Local webhook HTTP", res.status);
        } else {
          const kind = update.message?.text || update.callback_query?.data || "?";
          console.log("handled:", kind);
        }
      } catch (err) {
        console.error(
          "Не удалось достучаться до",
          localWebhook,
          "— запущен ли npm run dev?",
          err.message || err
        );
      }
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
