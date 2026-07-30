import { createHmac, timingSafeEqual } from "crypto";
import { getBotToken } from "@/lib/telegram";

export type VerifiedWebAppUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
};

/**
 * Validate Telegram WebApp initData (HMAC-SHA256).
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyTelegramWebAppInitData(
  initData: string,
  maxAgeSec = 86400
): { ok: true; user: VerifiedWebAppUser | null } | { ok: false; error: string } {
  const token = getBotToken();
  if (!token) return { ok: false, error: "no bot token" };
  if (!initData?.trim()) return { ok: false, error: "empty initData" };

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { ok: false, error: "missing hash" };

  params.delete("hash");
  const entries = Array.from(params.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(token).digest();
  const calculated = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  try {
    const a = Buffer.from(calculated, "hex");
    const b = Buffer.from(hash, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { ok: false, error: "bad signature" };
    }
  } catch {
    return { ok: false, error: "bad signature" };
  }

  const authDate = Number(params.get("auth_date") || 0);
  if (!Number.isFinite(authDate) || authDate <= 0) {
    return { ok: false, error: "bad auth_date" };
  }
  const age = Math.floor(Date.now() / 1000) - authDate;
  if (age > maxAgeSec || age < -60) {
    return { ok: false, error: "initData expired" };
  }

  let user: VerifiedWebAppUser | null = null;
  const userRaw = params.get("user");
  if (userRaw) {
    try {
      const parsed = JSON.parse(userRaw) as VerifiedWebAppUser;
      if (parsed?.id && Number.isFinite(parsed.id)) {
        user = {
          id: parsed.id,
          first_name: parsed.first_name,
          last_name: parsed.last_name,
          username: parsed.username,
        };
      }
    } catch {
      // ignore user parse
    }
  }

  return { ok: true, user };
}
