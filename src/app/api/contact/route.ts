import { NextResponse } from "next/server";
import {
  extractTelegramUsername,
  isValidContactBody,
  type ContactBody,
} from "@/lib/contact-validation";
import { clientIp, pruneRateLimitBuckets, rateLimit } from "@/lib/rate-limit";
import {
  escapeHtml,
  getOwnerChatId,
  sendMessage,
} from "@/lib/telegram";

export const runtime = "nodejs";

const CONTACT_LIMIT = 5;
const CONTACT_WINDOW_MS = 15 * 60 * 1000;

async function sendFormspree(payload: {
  name: string;
  contact: string;
  type: string;
  message: string;
}) {
  // Prefer server-only FORMSPREE_ID; NEXT_PUBLIC_ is accepted for legacy .env only.
  const id = process.env.FORMSPREE_ID?.trim();
  if (!id) return false;

  const res = await fetch(`https://formspree.io/f/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name: payload.name,
      contact: payload.contact,
      type: payload.type,
      message: payload.message,
      _subject: `DevFuture бриф: ${payload.type}`,
    }),
  });
  return res.ok;
}

export async function POST(request: Request) {
  pruneRateLimitBuckets();

  const ip = clientIp(request);
  const limited = rateLimit(`contact:${ip}`, CONTACT_LIMIT, CONTACT_WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      {
        error: "Слишком много заявок. Попробуйте позже или напишите в Telegram.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      }
    );
  }

  let body: ContactBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  // Honeypot — pretend success so bots leave quietly
  if (body.company?.trim()) {
    return NextResponse.json({ ok: true, delivered: true, channel: "noop" });
  }

  if (!isValidContactBody(body)) {
    return NextResponse.json(
      {
        error:
          "Заполните имя, контакт, тип задачи и описание (от 10 символов)",
      },
      { status: 400 }
    );
  }

  const name = body.name.trim();
  const contact = body.contact.trim();
  const type = body.type.trim();
  const message = body.message.trim();
  const source = body.source?.trim() || "";
  const when = new Date().toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
  });

  const text = [
    "🆕 <b>Новая заявка DevFuture</b>",
    `🕐 ${escapeHtml(when)} (МСК)`,
    source ? `🏷 Источник: <code>${escapeHtml(source)}</code>` : "",
    "",
    `👤 <b>Имя:</b> ${escapeHtml(name)}`,
    `📱 <b>Контакт:</b> ${escapeHtml(contact)}`,
    `🧩 <b>Тип:</b> ${escapeHtml(type)}`,
    "",
    "<b>Задача:</b>",
    escapeHtml(message),
  ]
    .filter(Boolean)
    .join("\n");

  const tgUser = extractTelegramUsername(contact);
  const replyMarkup = tgUser
    ? {
        inline_keyboard: [
          [
            {
              text: "Написать клиенту в Telegram",
              url: `https://t.me/${tgUser}`,
            },
          ],
        ],
      }
    : undefined;

  const owner = getOwnerChatId();
  let telegramOk = false;
  let telegramReason = "Не задан TELEGRAM_CHAT_ID или токен";

  if (owner) {
    const result = await sendMessage(owner, text, {
      reply_markup: replyMarkup,
    });
    telegramOk = result.ok;
    if (!result.ok) {
      telegramReason =
        result.description || "Telegram API отклонил сообщение";
    }
  }

  if (telegramOk) {
    return NextResponse.json({
      ok: true,
      delivered: true,
      channel: "telegram",
    });
  }

  const viaFormspree = await sendFormspree({ name, contact, type, message });
  if (viaFormspree) {
    return NextResponse.json({
      ok: true,
      delivered: true,
      channel: "formspree",
      warning: telegramReason,
    });
  }

  // Soft delivery failure → hard HTTP error so UI does not show fake success
  return NextResponse.json(
    {
      ok: false,
      delivered: false,
      fallback: "telegram",
      error: telegramReason,
    },
    { status: 503 }
  );
}
