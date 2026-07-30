/** Client-side UTM / click-id attribution for lead.source */

const STORAGE_KEY = "df_attribution";

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  yclid?: string;
  gclid?: string;
  capturedAt?: string;
};

const KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "yclid",
  "gclid",
] as const;

export function readAttributionFromSearch(
  search: string | URLSearchParams
): Attribution | null {
  const params =
    typeof search === "string" ? new URLSearchParams(search) : search;
  const out: Attribution = {};
  let hit = false;
  for (const key of KEYS) {
    const v = params.get(key)?.trim();
    if (v) {
      out[key] = v.slice(0, 120);
      hit = true;
    }
  }
  if (!hit) return null;
  out.capturedAt = new Date().toISOString();
  return out;
}

export function saveAttribution(attr: Attribution) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attr));
  } catch {
    // ignore
  }
}

export function loadAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Attribution;
  } catch {
    return null;
  }
}

/** Compact tag for lead.source, e.g. contact_form|utm:yandex|cpc|brand */
export function formatSourceTag(
  base: string,
  attr?: Attribution | null
): string {
  const parts = [base.slice(0, 40)];
  if (!attr) return parts.join("|");
  if (attr.utm_source) parts.push(`utm:${attr.utm_source}`);
  if (attr.utm_medium) parts.push(attr.utm_medium);
  if (attr.utm_campaign) parts.push(attr.utm_campaign.slice(0, 40));
  if (attr.yclid) parts.push("yclid");
  if (attr.gclid) parts.push("gclid");
  return parts.join("|").slice(0, 180);
}
