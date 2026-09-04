/** Site-wide config for SEO, contacts and marketing copy */

const telegramUsername =
  process.env.NEXT_PUBLIC_TELEGRAM_USERNAME?.replace(/^@/, "") || "devfuture";

const phoneRaw =
  process.env.NEXT_PUBLIC_PHONE?.trim() || "+7 (985) 490-48-80";

export const siteConfig = {
  name: "DevFuture",
  legalName: "Дубков Денис Степанович",
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
  /**
   * Публичный Telegram — всегда бот.
   * Личный менеджер: только NEXT_PUBLIC_TELEGRAM_USERNAME (не для CTA).
   */
  telegramUrl: `https://t.me/${
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, "") ||
    "dfuture_bot"
  }`,
  sameAs: [
    `https://t.me/${
      process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, "") ||
      "dfuture_bot"
    }`,
  ],
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

/** Deep-link with prefilled brief — через бота (не личный аккаунт) */
export function telegramBriefLink(text: string) {
  // У ботов нет ?text= как у личных чатов — открываем /start с меткой
  void text;
  return telegramBotStartLink("order");
}

/** One-click «хочу связаться» → бот @dfuture_bot */
export function telegramContactLink() {
  return telegramBotStartLink("order");
}

/**
 * Username бота для всех публичных CTA.
 * По умолчанию dfuture_bot — не подставляем личный аккаунт менеджера.
 */
export function telegramBotUsername() {
  return (
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, "") ||
    "dfuture_bot"
  );
}

/** Публичный URL бота (для кнопок и sameAs) */
export function telegramBotUrl() {
  return `https://t.me/${telegramBotUsername()}`;
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
