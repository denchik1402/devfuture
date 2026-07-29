/**
 * Registers Telegram webhook. Prefers curl -4 (IPv4) for VPS.
 *
 * Usage: npm run tg:set-webhook
 *
 * If Telegram cannot reach the site host (getWebhookInfo → Connection timed out),
 * set TELEGRAM_WEBHOOK_URL to the foreign proxy relay, e.g.:
 *   TELEGRAM_WEBHOOK_URL=https://tg-proxy.devfuture.ru/webhook
 */

const { loadEnvFiles, tgPost, tgGet } = require("./telegram-cli-shared");

async function main() {
  loadEnvFiles();
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const webhookOverride = process.env.TELEGRAM_WEBHOOK_URL?.trim();

  if (!token) {
    console.error("Нет TELEGRAM_BOT_TOKEN");
    process.exit(1);
  }

  let url = webhookOverride || "";
  if (!url) {
    if (!site || site.includes("localhost")) {
      console.error(
        "Нужен TELEGRAM_WEBHOOK_URL или публичный NEXT_PUBLIC_SITE_URL."
      );
      process.exit(1);
    }
    url = `${site}/api/telegram/webhook`;
  }

  if (!secret) {
    console.warn(
      "⚠ TELEGRAM_WEBHOOK_SECRET пуст. На проде webhook без секрета → 500."
    );
  }

  const body = {
    url,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: true,
    ...(secret ? { secret_token: secret } : {}),
  };

  let data;
  try {
    data = await tgPost(`/bot${token}/setWebhook`, body);
  } catch (e) {
    console.error("setWebhook network error:", e.message);
    console.error(
      "С VPS нет доступа к Telegram. Проверьте TELEGRAM_API_BASE / прокси."
    );
    process.exit(1);
  }

  console.log(data);

  try {
    const info = await tgGet(`/bot${token}/getWebhookInfo`);
    console.log("Webhook info:", JSON.stringify(info.result, null, 2));
    if (info.result?.last_error_message) {
      console.warn(
        "\n⚠ Telegram ещё видит ошибку доставки:",
        info.result.last_error_message
      );
      console.warn(
        "Если Connection timed out на сайт — используйте relay:\n" +
          "  TELEGRAM_WEBHOOK_URL=https://tg-proxy.ВАШ_ДОМЕН/webhook"
      );
    }
  } catch {
    /* ignore */
  }

  if (data.ok) {
    console.log(`\nГотово. Webhook → ${url}`);
    console.log("Напишите боту /start.");
  } else {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
