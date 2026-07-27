/**
 * Registers Telegram webhook. Prefers curl -4 (IPv4) for VPS.
 *
 * Usage: npm run tg:set-webhook
 * Or from PC (when VPS cannot reach Telegram):
 *   set NEXT_PUBLIC_SITE_URL=https://devfuture.ru
 *   npm run tg:set-webhook
 */

const { loadEnvFiles, tgPost, tgGet } = require("./telegram-cli-shared");

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
      "NEXT_PUBLIC_SITE_URL должен быть публичным https://доменом (не localhost)."
    );
    process.exit(1);
  }

  if (!secret) {
    console.warn(
      "⚠ TELEGRAM_WEBHOOK_SECRET пуст. На проде webhook без секрета → 500."
    );
  }

  const url = `${base}/api/telegram/webhook`;
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
      "С VPS нет доступа к Telegram. Поставьте webhook с домашнего ПК:\n" +
        "  1) Скопируйте TELEGRAM_* из серверного .env.local в локальный\n" +
        "  2) NEXT_PUBLIC_SITE_URL=https://devfuture.ru\n" +
        "  3) npm run tg:set-webhook"
    );
    process.exit(1);
  }

  console.log(data);

  try {
    const info = await tgGet(`/bot${token}/getWebhookInfo`);
    console.log("Webhook info:", JSON.stringify(info.result, null, 2));
  } catch {
    /* ignore */
  }

  if (data.ok) {
    console.log(`\nГотово. Напишите боту /start.`);
    console.log(
      "Если бот всё ещё молчит — VPS не может вызвать sendMessage (тот же блок api.telegram.org)."
    );
  } else {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
