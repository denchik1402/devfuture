import { NextResponse } from "next/server";
import {
  extractTelegramUsername,
  isValidContactBody,
  type ContactBody,
} from "@/lib/contact-validation";
import { ingestLeadAndNotify } from "@/lib/bot-notify";
import { clientIp, pruneRateLimitBuckets, rateLimit } from "@/lib/rate-limit";
import { escapeHtml, getOwnerChatId, sendMessage } from "@/lib/telegram";
import { verifyTelegramWebAppInitData } from "@/lib/telegram-webapp";
import { telegramBotStartLink } from "@/lib/site";

export const runtime = "nodejs";

const CONTACT_LIMIT = 5;
const CONTACT_WINDOW_MS = 15 * 60 * 1000;

async function sendFormspree(payload: {
  name: string;
  contact: string;
  type: string;
  message: string;
}) {
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

  if (body.company?.trim()) {
    return NextResponse.json({ ok: true, delivered: true, channel: "noop" });
  }

  if (!isValidContactBody(body)) {
    return NextResponse.json(
      {
        error:
          "Заполните имя, контакт, описание (от 10 символов) и согласие с политикой",
      },
      { status: 400 }
    );
  }

  let source = body.source?.trim() || "contact_form";
  let fromId: number | undefined;
  let username = extractTelegramUsername(body.contact.trim()) || undefined;
  let chatId = 0;

  const isMiniApp = source.includes("telegram_mini_app");
  if (isMiniApp) {
    const verified = verifyTelegramWebAppInitData(body.initData || "");
    if (!verified.ok) {
      return NextResponse.json(
        { error: "Сессия Mini App не подтверждена. Откройте снова из Telegram." },
        { status: 401 }
      );
    }
    if (verified.user) {
      fromId = verified.user.id;
      chatId = verified.user.id;
      if (verified.user.username) username = verified.user.username;
    }
  }

  const name = body.name.trim();
  const contact = body.contact.trim();
  const type = body.type.trim();
  const message = body.message.trim();
  const task = [`Тип: ${type}`, "", message].join("\n");

  try {
    const lead = await ingestLeadAndNotify({
      chatId,
      name,
      contact,
      task,
      fromId,
      username,
      source,
      title: isMiniApp
        ? "🆕 <b>Заявка из Mini App</b>"
        : "🆕 <b>Новая заявка DevFuture</b>",
    });
    return NextResponse.json({
      ok: true,
      delivered: true,
      channel: "telegram",
      leadId: lead.id,
      continueInBot: telegramBotStartLink(`lead_${lead.id}`),
    });
  } catch (err) {
    console.error("[contact] ingest failed", err);
  }

  const when = new Date().toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
  });
  const text = [
    "🆕 <b>Новая заявка DevFuture</b>",
    `🕐 ${escapeHtml(when)} (МСК)`,
    `🏷 Источник: <code>${escapeHtml(source)}</code>`,
    "",
    `👤 <b>Имя:</b> ${escapeHtml(name)}`,
    `📱 <b>Контакт:</b> ${escapeHtml(contact)}`,
    `🧩 <b>Тип:</b> ${escapeHtml(type)}`,
    "",
    "<b>Задача:</b>",
    escapeHtml(message),
  ].join("\n");

  const replyMarkup = username
    ? {
        inline_keyboard: [
          [
            {
              text: "Написать клиенту в Telegram",
              url: `https://t.me/${username}`,
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
