/**
 * Registers Telegram webhook to your public HTTPS URL.
 *
 * Usage:
 *   1. Site must be available at https://your-domain.com
 *   2. .env.local / .env: TELEGRAM_BOT_TOKEN, NEXT_PUBLIC_SITE_URL
 *   3. Optional: TELEGRAM_WEBHOOK_SECRET=random_string
 *   4. npm run tg:set-webhook
 */

const fs = require("fs");
const path = require("path");

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

async function main() {
  loadEnvFiles();
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();

  if (!token) {
    console.error("Нет TELEGRAM_BOT_TOKEN");
    process.exit(1);
  }
  if (!base || base.includes("localhost")) {
    console.error(
      "NEXT_PUBLIC_SITE_URL должен быть публичным https://доменом (не localhost).\n" +
        "Webhook Telegram не умеет ходить на localhost без туннеля (ngrok)."
    );
    process.exit(1);
  }

  if (!secret) {
    console.warn(
      "⚠ TELEGRAM_WEBHOOK_SECRET пуст. На проде webhook без секрета запрещён (500).\n" +
        "Сгенерируйте: openssl rand -hex 32 и пропишите в .env.local"
    );
  }

  const url = `${base}/api/telegram/webhook`;
  const body = {
    url,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: true,
    ...(secret ? { secret_token: secret } : {}),
  };

  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  console.log(data);

  const info = await fetch(
    `https://api.telegram.org/bot${token}/getWebhookInfo`
  ).then((r) => r.json());
  console.log("Webhook info:", JSON.stringify(info.result, null, 2));

  if (data.ok) {
    console.log(`\nГотово. Напишите боту /start — должны появиться кнопки.`);
  } else {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
