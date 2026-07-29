/**
 * Sets Telegram chat menu button to open the Mini App.
 * Usage: npm run tg:menu-button
 */
const { loadEnvFiles, tgPost, tgGet } = require("./telegram-cli-shared");

async function main() {
  loadEnvFiles();
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    console.error("Нет TELEGRAM_BOT_TOKEN");
    process.exit(1);
  }

  const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const url = (
    process.env.NEXT_PUBLIC_TELEGRAM_MINI_APP_URL ||
    (site ? `${site}/tg` : "")
  ).replace(/\/$/, "");

  if (!url || !url.startsWith("https://")) {
    console.error(
      "Нужен HTTPS URL Mini App: NEXT_PUBLIC_TELEGRAM_MINI_APP_URL или NEXT_PUBLIC_SITE_URL=/tg"
    );
    process.exit(1);
  }

  const data = await tgPost(`/bot${token}/setChatMenuButton`, {
    menu_button: {
      type: "web_app",
      text: "Приложение",
      web_app: { url },
    },
  });
  console.log(data);

  try {
    const info = await tgGet(`/bot${token}/getChatMenuButton`);
    console.log("Menu button:", JSON.stringify(info.result, null, 2));
  } catch {
    /* ignore */
  }

  if (!data.ok) process.exit(1);
  console.log(`\nГотово. Menu button → ${url}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
