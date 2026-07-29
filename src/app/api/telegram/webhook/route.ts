import { NextResponse } from "next/server";
import { handleTelegramUpdate, type TelegramUpdate } from "@/lib/bot";
import { clientIp, pruneRateLimitBuckets, rateLimit } from "@/lib/rate-limit";
import { getBotToken } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Telegram webhook endpoint.
 * Set webhook: npm run tg:set-webhook
 * URL: https://YOUR_DOMAIN/api/telegram/webhook
 */
export async function POST(request: Request) {
  const token = getBotToken();
  if (!token) {
    return NextResponse.json({ ok: false, error: "no token" }, { status: 500 });
  }

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const isProd = process.env.NODE_ENV === "production";

  // Fail closed in production — Telegram must send the secret header
  if (isProd && !secret) {
    console.error(
      "[telegram webhook] TELEGRAM_WEBHOOK_SECRET is required in production"
    );
    return NextResponse.json(
      { ok: false, error: "webhook secret not configured" },
      { status: 500 }
    );
  }

  if (secret) {
    const header = request.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  pruneRateLimitBuckets();
  const ip = clientIp(request);
  const limited = rateLimit(`tg-webhook:${ip}`, 120, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      }
    );
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const kind = update.callback_query
    ? `callback:${update.callback_query.data || "?"}`
    : update.message?.text
      ? `message:${update.message.text.slice(0, 40)}`
      : "empty";
  console.log(`[telegram webhook] update_id=${update.update_id} ${kind}`);

  try {
    await handleTelegramUpdate(update);
  } catch (err) {
    console.error("[telegram webhook]", err);
  }

  // Always 200 so Telegram does not retry endlessly on app bugs
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "DevFuture Telegram webhook",
    hint: "POST updates from Telegram here. Run: npm run tg:set-webhook",
  });
}
