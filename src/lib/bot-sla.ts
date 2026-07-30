import { listLeads, type BotLead } from "@/lib/bot-leads";
import { notifyAdmins } from "@/lib/bot-notify";
import { escapeHtml } from "@/lib/telegram";

const DEFAULT_HOURS = 4;
let lastSlaPingAt = 0;
let lastSla24PingAt = 0;

export function listStaleNewLeads(hours = DEFAULT_HOURS): BotLead[] {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  return listLeads(50).filter((l) => {
    if (l.status !== "new") return false;
    const t = Date.parse(l.at);
    return Number.isFinite(t) && t < cutoff;
  });
}

export function formatSlaReport(hours = DEFAULT_HOURS) {
  const stale = listStaleNewLeads(hours);
  if (!stale.length) {
    return [
      `<b>⏰ SLA</b>`,
      "",
      `Нет заявок в статусе «новая» старше ${hours} ч.`,
    ].join("\n");
  }
  return [
    `<b>⏰ SLA: ${stale.length} без ответа &gt; ${hours} ч</b>`,
    "",
    ...stale.slice(0, 10).map((l) => {
      const when = new Date(l.at).toLocaleString("ru-RU", {
        timeZone: "Europe/Moscow",
      });
      return `• ${escapeHtml(l.name)} · <code>${escapeHtml(l.id)}</code>\n  ${escapeHtml(when)} · ${escapeHtml(l.contact)}`;
    }),
  ].join("\n");
}

/** At most once per hour on webhook traffic — remind admins about stale leads */
export async function maybePingSla(hours = DEFAULT_HOURS) {
  const now = Date.now();
  if (now - lastSlaPingAt < 60 * 60 * 1000) return;
  lastSlaPingAt = now;
  const stale = listStaleNewLeads(hours);
  if (!stale.length) return;
  await notifyAdmins(formatSlaReport(hours));
}

/** At most once per ~20h — escalate leads without answer > 24h */
export async function maybePingSla24() {
  const now = Date.now();
  if (now - lastSla24PingAt < 20 * 60 * 60 * 1000) return;
  lastSla24PingAt = now;
  const stale = listStaleNewLeads(24);
  if (!stale.length) return;
  await notifyAdmins(
    [
      formatSlaReport(24),
      "",
      "Эскалация: заявки без ответа больше суток.",
    ].join("\n")
  );
}
