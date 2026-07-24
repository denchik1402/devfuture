/**
 * Prints your Telegram chat_id after you write /start to the bot.
 *
 * Usage:
 *   1. Create a bot via @BotFather → copy token
 *   2. Put token into .env.local as TELEGRAM_BOT_TOKEN=...
 *   3. Open the bot in Telegram and send /start
 *   4. Run: npm run tg:chat-id
 *   5. Copy chat_id into .env.local as TELEGRAM_CHAT_ID=...
 */

const fs = require("fs");
const path = require("path");

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
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

async function main() {
  loadEnvLocal();
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    console.error(
      "Нет TELEGRAM_BOT_TOKEN. Добавьте его в .env.local и повторите."
    );
    process.exit(1);
  }

  const res = await fetch(
    `https://api.telegram.org/bot${token}/getUpdates?limit=20`
  );
  const data = await res.json();

  if (!data.ok) {
    console.error("Telegram error:", data.description || data);
    process.exit(1);
  }

  const updates = data.result || [];
  if (!updates.length) {
    console.log(
      "Обновлений нет. Напишите боту /start в Telegram и запустите снова: npm run tg:chat-id"
    );
    process.exit(0);
  }

  const seen = new Map();
  for (const u of updates) {
    const chat = u.message?.chat || u.my_chat_member?.chat;
    if (!chat) continue;
    const label =
      chat.username ||
      [chat.first_name, chat.last_name].filter(Boolean).join(" ") ||
      chat.title ||
      "chat";
    seen.set(String(chat.id), label);
  }

  console.log("Найденные chat_id:\n");
  for (const [id, label] of seen) {
    console.log(`  TELEGRAM_CHAT_ID=${id}   # ${label}`);
  }
  console.log(
    "\nСкопируйте нужный id в .env.local, перезапустите npm run dev."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
