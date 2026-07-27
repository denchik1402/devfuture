/**
 * Checks Telegram bot token + webhook without printing secrets.
 * Uses curl -4 first (VPS often cannot reach Telegram over IPv6).
 *
 * Usage: npm run tg:check
 */

const { loadEnvFiles, tgGet } = require("./telegram-cli-shared");

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
    process.exit(1);
  }

  let me;
  try {
    me = await tgGet(`/bot${token}/getMe`);
  } catch (e) {
    console.error("\nНе достучались до api.telegram.org:", e.message);
    console.error(
      "На VPS проверьте: curl -4 -v --max-time 15 https://api.telegram.org"
    );
    console.error(
      "Если таймаут — хостер режет Telegram. Варианты: прокси TELEGRAM_API_BASE или setWebhook с ПК."
    );
    process.exit(1);
  }

  if (!me.ok) {
    console.error("\ngetMe FAILED:", me.description || me);
    console.error("Токен недействителен. BotFather → Revoke → новый token.");
    process.exit(1);
  }

  console.log(`\nBot OK: @${me.result.username} (id ${me.result.id})`);

  try {
    const wh = await tgGet(`/bot${token}/getWebhookInfo`);
    if (wh.ok) {
      const r = wh.result;
      console.log(`Webhook URL: ${r.url || "(empty)"}`);
      console.log(`Pending updates: ${r.pending_update_count}`);
      if (r.last_error_message) {
        console.log(`Last error: ${r.last_error_message}`);
      }
    }
  } catch (e) {
    console.log("getWebhookInfo failed:", e.message);
  }

  if (site && !site.includes("localhost")) {
    try {
      const prod = await fetch(`${site}/api/telegram/webhook`).then((r) =>
        r.json()
      );
      console.log(`Prod GET webhook:`, prod.ok ? "ok" : prod);
    } catch (e) {
      console.log(`Prod webhook: ${e.message}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
