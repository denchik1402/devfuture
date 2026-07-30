import { getAdminIds, leadNotifyMarkup } from "@/lib/bot-admin";
import { pushLeadToCrm } from "@/lib/bot-crm";
import { addLead, type BotLead } from "@/lib/bot-leads";
import { escapeHtml, getOwnerChatId, sendMessage } from "@/lib/telegram";

export async function notifyAdmins(
  text: string,
  extra?: Record<string, unknown>
) {
  const targets = new Set<string>();
  const owner = getOwnerChatId();
  if (owner) targets.add(owner);
  for (const id of Array.from(getAdminIds())) {
    targets.add(String(id));
  }
  for (const target of Array.from(targets)) {
    await sendMessage(target, text, extra);
  }
}

/** Persist lead + CRM + admin notify with status/reply buttons */
export async function ingestLeadAndNotify(input: {
  chatId: number;
  name: string;
  contact: string;
  task: string;
  fromId?: number;
  username?: string;
  source?: string;
  title?: string;
}): Promise<BotLead> {
  const lead = addLead({
    chatId: input.chatId,
    name: input.name,
    contact: input.contact,
    task: input.task,
    fromId: input.fromId,
    username: input.username,
    source: input.source,
  });
  void pushLeadToCrm(lead);

  const when = new Date().toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
  });
  const title = input.title || "🆕 <b>Заявка DevFuture</b>";
  const notify = [
    title,
    `🕐 ${escapeHtml(when)} (МСК)`,
    input.source
      ? `🏷 Источник: <code>${escapeHtml(input.source)}</code>`
      : "",
    "",
    `👤 <b>Имя:</b> ${escapeHtml(input.name)}`,
    `📱 <b>Контакт:</b> ${escapeHtml(input.contact)}`,
    input.username
      ? `🔗 TG: @${escapeHtml(input.username)} (id: ${input.fromId ?? "—"})`
      : input.fromId
        ? `🔗 TG id: ${input.fromId}`
        : "",
    "",
    "<b>Задача:</b>",
    escapeHtml(input.task),
    "",
    `ID: <code>${escapeHtml(lead.id)}</code>`,
  ]
    .filter(Boolean)
    .join("\n");

  await notifyAdmins(notify, { reply_markup: leadNotifyMarkup(lead) });
  return lead;
}
