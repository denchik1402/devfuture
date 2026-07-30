import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/bot-admin";
import {
  addLeadNote,
  addLeadTag,
  leadStats,
  listLeads,
  setLeadAssignee,
  setLeadRemindAt,
  updateLeadStatus,
  type LeadStatus,
} from "@/lib/bot-leads";
import { verifyTelegramWebAppInitData } from "@/lib/telegram-webapp";

export const runtime = "nodejs";

const STATUSES: LeadStatus[] = ["new", "progress", "wait", "done"];

function requireAdmin(
  request: Request
): { ok: true; userId: number } | { ok: false; response: NextResponse } {
  const initData = request.headers.get("x-telegram-init-data") || "";
  const verified = verifyTelegramWebAppInitData(initData);
  if (!verified.ok) {
    return {
      ok: false,
      response: NextResponse.json({ error: verified.error }, { status: 401 }),
    };
  }
  const userId = verified.user?.id;
  if (!isAdmin(userId) || userId == null) {
    return {
      ok: false,
      response: NextResponse.json({ error: "forbidden" }, { status: 403 }),
    };
  }
  return { ok: true, userId };
}

export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const raw = Number(searchParams.get("limit") || 20);
  const limit = Number.isFinite(raw)
    ? Math.min(Math.max(1, Math.floor(raw)), 100)
    : 20;

  return NextResponse.json({
    leads: listLeads(limit),
    stats: leadStats(),
  });
}

export async function PATCH(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.ok) return auth.response;

  let body: {
    id?: string;
    status?: string;
    note?: string;
    tag?: string;
    assigneeSelf?: boolean;
    /** Snooze N days from now */
    snoozeDays?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  let lead = undefined as ReturnType<typeof listLeads>[number] | undefined;

  if (body.status != null) {
    if (!STATUSES.includes(body.status as LeadStatus)) {
      return NextResponse.json({ error: "bad status" }, { status: 400 });
    }
    lead = updateLeadStatus(id, body.status as LeadStatus);
    if (!lead) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
  }

  if (typeof body.note === "string" && body.note.trim()) {
    lead = addLeadNote(id, body.note.trim(), auth.userId);
    if (!lead) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
  }

  if (typeof body.tag === "string" && body.tag.trim()) {
    lead = addLeadTag(id, body.tag.trim());
    if (!lead) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
  }

  if (body.assigneeSelf === true) {
    lead = setLeadAssignee(id, auth.userId);
    if (!lead) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
  }

  if (
    typeof body.snoozeDays === "number" &&
    Number.isFinite(body.snoozeDays) &&
    (body.snoozeDays === 1 || body.snoozeDays === 3)
  ) {
    const when = new Date(
      Date.now() + body.snoozeDays * 24 * 60 * 60 * 1000
    ).toISOString();
    lead = setLeadRemindAt(id, when);
    if (!lead) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
  }

  if (!lead) {
    return NextResponse.json(
      { error: "nothing to update" },
      { status: 400 }
    );
  }

  return NextResponse.json({ lead });
}
