"use client";

import {
  COOKIE_CONSENT_KEY,
  type CookieConsentValue,
} from "@/lib/legal";

export function readCookieConsent(): CookieConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (v === "accepted" || v === "rejected") return v;
  } catch {
    // ignore
  }
  return null;
}

export function writeCookieConsent(value: CookieConsentValue) {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
    window.dispatchEvent(
      new CustomEvent("df:cookie-consent", { detail: value })
    );
  } catch {
    // ignore
  }
}

export function analyticsAllowed(): boolean {
  return readCookieConsent() === "accepted";
}
