import { FAQ_ITEMS, PACKAGES } from "@/lib/content";
import { SERVICE_PAGES } from "@/lib/services";
import { escapeHtml } from "@/lib/telegram";

export type StartPayload =
  | { kind: "menu" }
  | { kind: "order"; hint?: string }
  | { kind: "speed" }
  | { kind: "faq" }
  | { kind: "packages" }
  | { kind: "package"; id: string }
  | { kind: "service"; slug: string };

/** Parse /start payload (BotFather deep-link ?start=...) */
export function parseStartPayload(text: string): StartPayload {
  const raw = text.replace(/^\/start(?:@\w+)?\s*/i, "").trim();
  if (!raw) return { kind: "menu" };

  const key = raw.slice(0, 64).toLowerCase();

  if (key === "order" || key === "lead") return { kind: "order" };
  if (key === "speed" || key === "demo") return { kind: "speed" };
  if (key === "faq") return { kind: "faq" };
  if (key === "packages" || key === "price" || key === "prices") {
    return { kind: "packages" };
  }

  if (key.startsWith("pkg_")) {
    const id = key.slice(4);
    if (PACKAGES.some((p) => p.id === id)) return { kind: "package", id };
  }

  if (key.startsWith("svc_")) {
    const slug = key.slice(4);
    if (SERVICE_PAGES.some((s) => s.slug === slug)) {
      return { kind: "service", slug };
    }
  }

  return { kind: "menu" };
}

export function faqKeyboard() {
  return {
    inline_keyboard: [
      ...FAQ_ITEMS.map((_, i) => [
        {
          text: FAQ_ITEMS[i].q.slice(0, 60),
          callback_data: `faq:${i}`,
        },
      ]),
      [
        { text: "🚀 Заявка", callback_data: "order" },
        { text: "⬅️ Меню", callback_data: "menu" },
      ],
    ],
  };
}

export function faqAnswer(index: number) {
  const item = FAQ_ITEMS[index];
  if (!item) return null;
  return `<b>${escapeHtml(item.q)}</b>\n\n${escapeHtml(item.a)}`;
}

export function packagesKeyboard() {
  return {
    inline_keyboard: [
      ...PACKAGES.map((p) => [
        {
          text: `${p.name} · от ${p.priceFrom}`,
          callback_data: `pkg:${p.id}`,
        },
      ]),
      [
        { text: "🚀 Заявка", callback_data: "order" },
        { text: "⬅️ Меню", callback_data: "menu" },
      ],
    ],
  };
}

export function packageText(id: string) {
  const pkg = PACKAGES.find((p) => p.id === id);
  if (!pkg) return null;
  return [
    `<b>${escapeHtml(pkg.name)}</b> · от ${escapeHtml(pkg.priceFrom)}`,
    pkg.badge ? `<i>${escapeHtml(pkg.badge)}</i>` : "",
    "",
    escapeHtml(pkg.description),
    "",
    "<b>Входит:</b>",
    ...pkg.includes.map((x) => `• ${escapeHtml(x)}`),
  ]
    .filter(Boolean)
    .join("\n");
}

export function packageKeyboard(id: string) {
  return {
    inline_keyboard: [
      [{ text: "🚀 Заявка по этому пакету", callback_data: `order:pkg_${id}` }],
      [
        { text: "💰 Все пакеты", callback_data: "packages" },
        { text: "⬅️ Меню", callback_data: "menu" },
      ],
    ],
  };
}

export function serviceBotText(slug: string) {
  const s = SERVICE_PAGES.find((x) => x.slug === slug);
  if (!s) return null;
  return [
    `<b>${escapeHtml(s.shortName)}</b> — от ${escapeHtml(s.priceFrom)}`,
    "",
    escapeHtml(s.description),
  ].join("\n");
}

export function serviceBotKeyboard(slug: string) {
  return {
    inline_keyboard: [
      [
        {
          text: "🚀 Заявка по услуге",
          callback_data: `order:svc_${slug}`.slice(0, 64),
        },
      ],
      [
        { text: "🛠 Все услуги", callback_data: "services" },
        { text: "⬅️ Меню", callback_data: "menu" },
      ],
    ],
  };
}

export function packagesListText() {
  return [
    "<b>💰 Пакеты и ориентиры по цене</b>",
    "",
    ...PACKAGES.map(
      (p) =>
        `• <b>${escapeHtml(p.name)}</b> — от ${escapeHtml(p.priceFrom)}\n  ${escapeHtml(p.description.slice(0, 120))}${p.description.length > 120 ? "…" : ""}`
    ),
    "",
    "Откройте пакет или оставьте заявку:",
  ].join("\n");
}

export function faqListText() {
  return [
    "<b>❓ FAQ</b>",
    "",
    "Частые вопросы — нажмите кнопку:",
  ].join("\n");
}
