import { draftsCount } from "@/lib/bot-drafts";
import {
  leadStats,
  listLeads,
  STATUS_LABEL,
  type BotLead,
  type LeadStatus,
} from "@/lib/bot-leads";
import { usersCount } from "@/lib/bot-users";
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
        { text: "📣 Рассылка", callback_data: "admin:broadcast" },
        { text: "🧹 Черновики", callback_data: "admin:drafts" },
      ],
      [
        { text: "🔔 Тест-пинг", callback_data: "admin:ping" },
        { text: "⬅️ Клиентское меню", callback_data: "menu" },
      ],
    ],
  };
}

export function adminWelcomeText() {
  return [
    "<b>Админ-панель DevFuture</b>",
    "",
    "Только для TELEGRAM_CHAT_ID / TELEGRAM_ADMIN_IDS.",
    "Выберите действие:",
  ].join("\n");
}

export function formatAdminStats() {
  const stats = leadStats();
  const drafts = draftsCount();
  const users = usersCount();
  return [
    "<b>📊 Статистика бота</b>",
    "",
    `Пользователей бота: <b>${users}</b>`,
    `Заявок всего: <b>${stats.total}</b> (сегодня: <b>${stats.today}</b>)`,
    `🆕 Новые: <b>${stats.new}</b>`,
    `🔄 В работе: <b>${stats.progress}</b>`,
    `✅ Закрыты: <b>${stats.done}</b>`,
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
    lead.task.length > 140 ? `${lead.task.slice(0, 140)}…` : lead.task;
  return [
    `<b>${index + 1}.</b> ${STATUS_LABEL[lead.status]} · ${escapeHtml(lead.name)}`,
    `${escapeHtml(when)} · ${tg}`,
    `📱 ${escapeHtml(lead.contact)}`,
    escapeHtml(task),
    `<code>${escapeHtml(lead.id)}</code>`,
  ].join("\n");
}

export function formatRecentLeads(limit = 5) {
  const leads = listLeads(limit);
  if (!leads.length) {
    return "<b>📋 Заявки</b>\n\nПока пусто.";
  }
  return [
    `<b>📋 Последние заявки</b>`,
    "",
    ...leads.map((l, i) => formatLead(l, i)),
    "",
    "Статус — кнопками под уведомлением. Удаление — 🗑 ниже.",
  ].join("\n\n");
}

export function leadsManageKeyboard(leads: BotLead[]) {
  const rows = leads.map((l) => [
    {
      text: `🗑 ${l.name.slice(0, 28) || l.id}`,
      callback_data: `ld:${l.id}`,
    },
  ]);
  rows.push([{ text: "⬅️ В админку", callback_data: "admin" }]);
  return { inline_keyboard: rows };
}

export function leadDeleteConfirmKeyboard(id: string) {
  return {
    inline_keyboard: [
      [
        { text: "✅ Да, удалить", callback_data: `ldc:${id}` },
        { text: "❌ Отмена", callback_data: "admin:leads" },
      ],
    ],
  };
}

export function leadNotifyMarkup(lead: BotLead) {
  const rows: { text: string; callback_data?: string; url?: string }[][] = [
    [
      { text: "🆕 Новая", callback_data: `ls:new:${lead.id}` },
      { text: "🔄 В работе", callback_data: `ls:progress:${lead.id}` },
      { text: "✅ Закрыть", callback_data: `ls:done:${lead.id}` },
    ],
    [
      { text: "💬 Ответить", callback_data: `reply:${lead.chatId}` },
      { text: "🗑 Удалить", callback_data: `ld:${lead.id}` },
    ],
  ];
  if (lead.username) {
    rows.push([
      { text: "Написать в TG", url: `https://t.me/${lead.username}` },
    ]);
  }
  return { inline_keyboard: rows };
}

export function questionNotifyMarkup(fromChatId: number) {
  return {
    inline_keyboard: [
      [{ text: "💬 Ответить", callback_data: `reply:${fromChatId}` }],
    ],
  };
}

export function parseLeadStatusCallback(
  data: string
): { status: LeadStatus; id: string } | null {
  const m = data.match(/^ls:(new|progress|done):([A-Za-z0-9]+)$/);
  if (!m) return null;
  return { status: m[1] as LeadStatus, id: m[2] };
}
