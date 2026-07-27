/**
 * Checks Telegram bot token + webhook without printing secrets.
 *
 * Usage: npm run tg:check
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
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

  console.log("--- DevFuture Telegram check ---");
  console.log(`TOKEN: ${token ? `set (${token.length} chars)` : "MISSING"}`);
  console.log(`CHAT_ID: ${chatId ? "set" : "MISSING"}`);
  console.log(`WEBHOOK_SECRET: ${secret ? "set" : "MISSING"}`);
  console.log(`SITE_URL: ${site || "MISSING"}`);

  if (!token) {
    console.error("\nНужен TELEGRAM_BOT_TOKEN в .env.local");
    console.error(
      "Получить: @BotFather → /mybots → API Token (или /newbot / /revoke)"
    );
    process.exit(1);
  }

  const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
  const me = await meRes.json();
  if (!me.ok) {
    console.error("\ngetMe FAILED:", me.description || me);
    console.error(
      "Токен недействителен или отозван. В BotFather: /revoke → новый token → впишите в .env.local и на сервер → npm run tg:set-webhook"
    );
    process.exit(1);
  }

  console.log(`\nBot OK: @${me.result.username} (id ${me.result.id})`);

  const whRes = await fetch(
    `https://api.telegram.org/bot${token}/getWebhookInfo`
  );
  const wh = await whRes.json();
  if (wh.ok) {
    const r = wh.result;
    console.log(`Webhook URL: ${r.url || "(empty — polling mode)"}`);
    console.log(`Pending updates: ${r.pending_update_count}`);
    if (r.last_error_message) {
      console.log(`Last error: ${r.last_error_message} @ ${r.last_error_date}`);
    }
  }

  if (site && !site.includes("localhost")) {
    try {
      const prod = await fetch(`${site}/api/telegram/webhook`).then((r) =>
        r.json()
      );
      console.log(`Prod GET /api/telegram/webhook:`, prod.ok ? "ok" : prod);
    } catch (e) {
      console.log(`Prod webhook unreachable: ${e.message}`);
    }
  }

  console.log("\nЕсли getMe OK, но бот молчит: npm run tg:set-webhook");
  console.log("Локально без публичного URL: npm run tg:poll");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
