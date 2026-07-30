#!/usr/bin/env node
/**
 * Ping Yandex IndexNow with key URLs after deploy.
 * Requires INDEXNOW_KEY in env (.env.local) matching public/indexnow-key.txt content.
 */
const { existsSync, readFileSync } = require("fs");
const path = require("path");

function loadEnvLocal() {
  const p = path.join(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

async function main() {
  loadEnvLocal();
  const key = (process.env.INDEXNOW_KEY || "").trim();
  if (!key) {
    console.log("skip IndexNow: INDEXNOW_KEY not set");
    return;
  }

  const base = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://devfuture.ru"
  ).replace(/\/$/, "");
  const host = new URL(base).host;

  const urlList = [
    `${base}/`,
    `${base}/uslugi`,
    `${base}/resheniya`,
    `${base}/keysy`,
    `${base}/blog`,
    ...[
      "telegram-bot-pod-klyuch",
      "bot-zapisi-dlya-salona",
      "bot-dlya-kliniki",
      "bot-dostavki",
      "bot-dlya-online-shkoly",
      "bot-b2b-zayavok",
      "avtomatizaciya-biznes-processov",
      "integraciya-crm-telegram",
      "bot-zapisi-klientov",
      "bot-dlya-internet-magazina",
    ].map((s) => `${base}/resheniya/${s}`),
    ...[
      "salon-booking",
      "shop-telegram-hub",
      "landing-leads",
      "status-cabinet",
      "clinic-booking",
      "delivery-bot",
      "online-school-bot",
    ].map((s) => `${base}/keysy/${s}`),
  ];

  const res = await fetch("https://yandex.com/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key,
      keyLocation: `https://${host}/indexnow-key.txt`,
      urlList,
    }),
  });

  console.log(
    `IndexNow ${res.status} · ${urlList.length} urls · ${res.statusText}`
  );
  if (!res.ok && res.status !== 202) {
    const text = await res.text().catch(() => "");
    console.warn(text.slice(0, 300));
  }
}

main().catch((err) => {
  console.warn("IndexNow failed:", err?.message || err);
  process.exit(0);
});
