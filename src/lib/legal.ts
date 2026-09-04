/**
 * Реквизиты и контакты для ЗОЗПП / 152-ФЗ.
 * Заполняются через NEXT_PUBLIC_* — иначе блок реквизитов скрыт.
 */

import { siteConfig } from "@/lib/site";

function env(name: string): string {
  const v = process.env[name]?.trim();
  return v && v.length > 0 ? v : "";
}

export const legalConfig = {
  /** ООО «…» / ИП Иванов И.И. */
  entityName: env("NEXT_PUBLIC_LEGAL_ENTITY") || siteConfig.legalName,
  /** ИП | ООО | самозанятый */
  entityType: env("NEXT_PUBLIC_LEGAL_TYPE") || "",
  inn: env("NEXT_PUBLIC_LEGAL_INN"),
  /** ОГРН или ОГРНИП */
  ogrn: env("NEXT_PUBLIC_LEGAL_OGRN"),
  /** Юридический адрес */
  address: env("NEXT_PUBLIC_LEGAL_ADDRESS"),
  email: env("NEXT_PUBLIC_LEGAL_EMAIL"),
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
