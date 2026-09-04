/** Site-wide config for SEO, contacts and marketing copy */

const telegramUsername =
  process.env.NEXT_PUBLIC_TELEGRAM_USERNAME?.replace(/^@/, "") || "devfuture";

const phoneRaw =
  process.env.NEXT_PUBLIC_PHONE?.trim() || "+7 (985) 490-48-80";

export const siteConfig = {
  name: "DevFuture",
  legalName: "DevFuture",
  tagline: "Цифровые продукты под ключ",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://devfuture.ru",
  locale: "ru_RU",
  language: "ru",
  /** Display number, e.g. +7 (900) 123-45-67 */
  phone: phoneRaw || undefined,
  /** tel:+79001234567 */
  phoneTel: phoneRaw
    ? `tel:${phoneRaw.replace(/[^\d+]/g, "")}`
    : undefined,
  /** Публичный email для связи и претензий */
  email:
    process.env.NEXT_PUBLIC_LEGAL_EMAIL?.trim() || "help@devfuture.ru",
  telegramUsername,
  telegramUrl:
    process.env.NEXT_PUBLIC_TELEGRAM_URL ?? `https://t.me/${telegramUsername}`,
  sameAs: [
    process.env.NEXT_PUBLIC_TELEGRAM_URL ?? `https://t.me/${telegramUsername}`,
  ].filter((u): u is string => Boolean(u && u.length > 12)),
  description:
    "DevFuture — разработка сайтов, веб-приложений, десктопных программ, Telegram-ботов и AI-решений. Анализ, дизайн, разработка и поддержка под ключ.",
  shortDescription:
    "Сайты, веб-приложения, десктоп, Telegram-боты и автоматизация. MVP от 1 дня, простые боты — часто в день обращения.",
  keywords: [
    "разработка сайтов",
    "веб-приложения",
    "десктопные приложения",
    "Telegram бот разработка",
    "лендинг под ключ",
    "личный кабинет",
    "автоматизация бизнеса",
    "AI интеграция",
    "Electron приложение",
    "Next.js разработка",
    "заказать сайт",
    "IT студия",
    "DevFuture",
  ],
  services: [
    "Разработка сайтов и лендингов",
    "Веб-приложения и личные кабинеты",
    "Десктопные приложения для Windows и macOS",
    "Telegram-боты и чат-автоматизация",
    "Интеграции с CRM, API и таблицами",
    "AI-помощники и умные сценарии",
    "Техподдержка и развитие продукта",
  ],
} as const satisfies {
  name: string;
  legalName: string;
  tagline: string;
  url: string;
  locale: string;
  language: string;
  phone: string | undefined;
  phoneTel: string | undefined;
  email: string;
  telegramUsername: string;
  telegramUrl: string;
  sameAs: string[];
  description: string;
  shortDescription: string;
  keywords: string[];
  services: string[];
};

export type SiteConfig = typeof siteConfig;

/** Deep-link with prefilled brief for Telegram (личный аккаунт менеджера) */
export function telegramBriefLink(text: string) {
  const encoded = encodeURIComponent(text);
  return `https://t.me/${siteConfig.telegramUsername}?text=${encoded}`;
}

/** One-click «хочу связаться» message */
export function telegramContactLink() {
  return telegramBriefLink(
    "Здравствуйте! Хочу обсудить проект с DevFuture."
  );
}

/**
 * Username бота (не личного аккаунта). Для deep-link /start.
 * NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=dfuture_bot
 */
export function telegramBotUsername() {
  return (
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, "") ||
    siteConfig.telegramUsername
  );
}

/** Deep-link в бота: https://t.me/bot?start=payload */
export function telegramBotStartLink(payload?: string) {
  const bot = telegramBotUsername();
  if (payload) {
    return `https://t.me/${bot}?start=${encodeURIComponent(payload)}`;
  }
  return `https://t.me/${bot}`;
}

/** URL Telegram Mini App (HTTPS на том же домене) */
export function telegramMiniAppUrl() {
  const explicit = process.env.NEXT_PUBLIC_TELEGRAM_MINI_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  return `${siteConfig.url.replace(/\/$/, "")}/tg`;
}
