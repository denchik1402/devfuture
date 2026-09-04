/**
 * Реквизиты и контакты для ЗОЗПП / 152-ФЗ.
 * Публичные значения по умолчанию; переопределяются через NEXT_PUBLIC_*.
 */

import { siteConfig } from "@/lib/site";

function env(name: string): string {
  const v = process.env[name]?.trim();
  return v && v.length > 0 ? v : "";
}

export const legalConfig = {
  /** Для самозанятого — ФИО плательщика НПД */
  entityName:
    env("NEXT_PUBLIC_LEGAL_ENTITY") || "Дубков Денис Степанович",
  /** ИП | ООО | самозанятый */
  entityType: env("NEXT_PUBLIC_LEGAL_TYPE") || "самозанятый",
  inn: env("NEXT_PUBLIC_LEGAL_INN") || "263111879019",
  /** ОГРН / ОГРНИП — у самозанятого без статуса ИП пусто */
  ogrn: env("NEXT_PUBLIC_LEGAL_OGRN"),
  /**
   * Адрес для ЗОЗПП: у самозанятого — адрес регистрации / регион деятельности.
   * Уточните полный адрес регистрации при необходимости.
   */
  address: env("NEXT_PUBLIC_LEGAL_ADDRESS") || "г. Москва",
  email: env("NEXT_PUBLIC_LEGAL_EMAIL") || siteConfig.email,
  phone: env("NEXT_PUBLIC_PHONE") || siteConfig.phone || "",
  phoneTel: siteConfig.phoneTel,
  /** Дата актуальности документов (ISO YYYY-MM-DD) */
  docsUpdated: env("NEXT_PUBLIC_LEGAL_DOCS_UPDATED") || "2026-09-04",
} as const;

export function hasLegalRequisites() {
  return Boolean(legalConfig.inn && (legalConfig.ogrn || legalConfig.entityType === "самозанятый"));
}

export function hasPublicContacts() {
  return Boolean(
    legalConfig.email && legalConfig.phone && legalConfig.address
  );
}

export function formatDocsDate() {
  try {
    return new Date(legalConfig.docsUpdated).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return legalConfig.docsUpdated;
  }
}

export const COOKIE_CONSENT_KEY = "df-cookie-consent";
export type CookieConsentValue = "accepted" | "rejected";

export const LEGAL_LINKS = [
  { href: "/privacy", label: "Политика конфиденциальности" },
  { href: "/oferta", label: "Публичная оферта" },
  { href: "/vozvrat", label: "Правила отказа и возврата" },
] as const;

/** Текст согласия у форм (сайт / Mini App); ссылка на /privacy — рядом в UI */
export const CONSENT_LABEL =
  "Согласен(на) на обработку персональных данных, в том числе на передачу данных в Telegram для ответа на заявку.";

/** Короткая строка для бота (HTML) */
export function consentBotHtml(privacyUrl: string) {
  return `Отправляя данные, вы соглашаетесь с <a href="${privacyUrl}">политикой конфиденциальности</a> и передачей контакта в Telegram для связи по заявке.`;
}
