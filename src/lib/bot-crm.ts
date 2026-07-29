import type { BotLead } from "@/lib/bot-leads";

/**
 * Optional CRM hook: POST each lead to Make / Zapier / Sheets / Notion.
 * Set LEADS_WEBHOOK_URL in .env.local
 */
export async function pushLeadToCrm(lead: BotLead) {
  const url = process.env["LEADS_WEBHOOK_URL"]?.trim();
  if (!url) return;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "telegram_lead",
        ...lead,
        sentAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) {
      console.error("[bot-crm] webhook status", res.status);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[bot-crm] webhook error:", message);
  }
}

export async function pushLeadStatusToCrm(
  lead: BotLead,
  prevStatus: string
) {
  const url = process.env["LEADS_WEBHOOK_URL"]?.trim();
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "telegram_lead_status",
        id: lead.id,
        status: lead.status,
        prevStatus,
        name: lead.name,
        chatId: lead.chatId,
        sentAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(12_000),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[bot-crm] status webhook error:", message);
  }
}
