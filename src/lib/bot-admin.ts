import { draftsCount } from "@/lib/bot-drafts";
import { leadStats, listLeads, type BotLead } from "@/lib/bot-leads";
import { escapeHtml, getOwnerChatId } from "@/lib/telegram";

/** Owner chat id + optional TELEGRAM_ADMIN_IDS=123,456 */
export function getAdminIds(): Set<number> {
  const ids = new Set<number>();
  const owner = getOwnerChatId();
  if (owner) {
    const n = Number(owner);
    if (Number.isFinite(n)) ids.add(n);
  }
  const extra = process.env["TELEGRAM_ADMIN_IDS"]?.trim() || "";
  for (const part of extra.split(",")) {
    const n = Number(part.trim());
    if (Number.isFinite(n) && n !== 0) ids.add(n);
  }
  return ids;
}

export function isAdmin(userId?: number | null): boolean {
  if (userId == null) return false;
  return getAdminIds().has(userId);
}

export function adminKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "📊 Статистика", callback_data: "admin:stats" },
        { text: "📋 Заявки", callback_data: "admin:leads" },
      ],
      [
        { text: "🧹 Черновики", callback_data: "admin:drafts" },
        { text: "🔔 Тест-пинг", callback_data: "admin:ping" },
      ],
      [{ text: "⬅️ В клиентское меню", callback_data: "menu" }],
    ],
  };
}

export function adminWelcomeText() {
  return [
    "<b>Админ-панель DevFuture</b>",
    "",
    "Видно только вам (по TELEGRAM_CHAT_ID / TELEGRAM_ADMIN_IDS).",
    "Выберите действие:",
  ].join("\n");
}

export function formatAdminStats() {
  const { total, today } = leadStats();
  const drafts = draftsCount();
  return [
    "<b>📊 Статистика бота</b>",
    "",
    `Заявок всего: <b>${total}</b>`,
    `Заявок сегодня: <b>${today}</b>`,
    `Открытых черновиков: <b>${drafts}</b>`,
  ].join("\n");
}

function formatLead(lead: BotLead, index: number) {
  const when = new Date(lead.at).toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
  });
  const tg = lead.username
    ? `@${escapeHtml(lead.username)}`
    : `id ${lead.fromId ?? lead.chatId}`;
  const task =
    lead.task.length > 160 ? `${lead.task.slice(0, 160)}…` : lead.task;
  return [
    `<b>${index + 1}.</b> ${escapeHtml(lead.name)} · ${escapeHtml(when)}`,
    `📱 ${escapeHtml(lead.contact)} · ${tg}`,
    escapeHtml(task),
  ].join("\n");
}

export function formatRecentLeads(limit = 5) {
  const leads = listLeads(limit);
  if (!leads.length) {
    return "<b>📋 Заявки</b>\n\nПока пусто — клиенты ещё не оставляли заявки через бота.";
  }
  return [
    `<b>📋 Последние заявки</b> (${leads.length})`,
    "",
    ...leads.map((l, i) => formatLead(l, i)),
  ].join("\n\n");
}
