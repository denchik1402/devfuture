import { NextResponse } from "next/server";
import { formatWeeklyDigest, listDueReminders, setLeadRemindAt } from "@/lib/bot-leads";
import { flushCrmQueue } from "@/lib/bot-crm";
import { formatSlaReport, maybePingSla, maybePingSla24 } from "@/lib/bot-sla";
import { notifyAdmins } from "@/lib/bot-notify";
import { escapeHtml, sendMessage } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cron-friendly ops endpoint.
 * Protect with CRON_SECRET (header x-cron-secret or ?secret=).
 * Example: 0 * * * * curl -fsS -H "x-cron-secret: $CRON_SECRET" https://devfuture.ru/api/cron/ops
 */
export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET not configured" },
      { status: 500 }
    );
  }
  const header = request.headers.get("x-cron-secret")?.trim();
  const url = new URL(request.url);
  const query = url.searchParams.get("secret")?.trim();
  if (header !== expected && query !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const digest = url.searchParams.get("digest") === "1";

  await maybePingSla(4);
  await maybePingSla24();
  await flushCrmQueue();

  const due = listDueReminders();
  let reminded = 0;
  for (const lead of due) {
    const target = lead.assigneeId || undefined;
    const text = [
      "⏰ <b>Напоминание по заявке</b>",
      `${escapeHtml(lead.name)} · <code>${escapeHtml(lead.id)}</code>`,
      escapeHtml(lead.contact),
      "",
      escapeHtml(lead.task.slice(0, 400)),
    ].join("\n");
    if (target) {
      await sendMessage(String(target), text);
    } else {
      await notifyAdmins(text);
    }
    setLeadRemindAt(lead.id, undefined);
    reminded += 1;
  }

  if (digest) {
    await notifyAdmins(
      [formatWeeklyDigest(), "", formatSlaReport(4), "", formatSlaReport(24)].join(
        "\n\n"
      )
    );
  }

  return NextResponse.json({
    ok: true,
    reminded,
    digest,
    ts: new Date().toISOString(),
  });
}
