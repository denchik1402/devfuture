import { existsSync, readFileSync } from "fs";
import path from "path";
import { atomicWriteJson } from "@/lib/atomic-write";

export type LeadStatus = "new" | "progress" | "wait" | "done";

export type LeadNote = {
  at: string;
  by?: number;
  text: string;
};

export type BotLead = {
  id: string;
  at: string;
  status: LeadStatus;
  chatId: number;
  name: string;
  contact: string;
  task: string;
  fromId?: number;
  username?: string;
  source?: string;
  notes?: LeadNote[];
  tags?: string[];
  remindAt?: string;
  assigneeId?: number;
};

const dataDir = path.join(process.cwd(), ".data");
const leadsFile = path.join(dataDir, "bot-leads.json");
const MAX_LEADS = 500;
const DEDUPE_MS = 15 * 60 * 1000;

let cache: BotLead[] | null = null;

function normalizeStatus(s: string | undefined): LeadStatus {
  if (s === "progress" || s === "wait" || s === "done" || s === "new") return s;
  return "new";
}

function load(): BotLead[] {
  if (cache) return cache;
  try {
    if (!existsSync(leadsFile)) {
      cache = [];
      return cache;
    }
    const raw = JSON.parse(readFileSync(leadsFile, "utf8")) as BotLead[];
    cache = Array.isArray(raw)
      ? raw.map((l) => ({
          ...l,
          status: normalizeStatus(l.status),
          notes: Array.isArray(l.notes) ? l.notes : [],
          tags: Array.isArray(l.tags) ? l.tags : [],
        }))
      : [];
  } catch (err) {
    console.error("[bot-leads] load failed", err);
    cache = [];
  }
  return cache;
}

function save(leads: BotLead[]) {
  cache = leads;
  try {
    atomicWriteJson(leadsFile, leads);
  } catch (err) {
    console.error("[bot-leads] save failed", err);
  }
}

function makeId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function normContact(c: string) {
  return c.trim().toLowerCase().replace(/\s+/g, "");
}

/** Recent lead with same contact (anti-dupe). */
export function findRecentDuplicate(
  contact: string,
  withinMs = DEDUPE_MS
): BotLead | undefined {
  const key = normContact(contact);
  if (!key || key === "—" || key === "-") return undefined;
  const cutoff = Date.now() - withinMs;
  return load().find((l) => {
    if (normContact(l.contact) !== key) return false;
    const t = Date.parse(l.at);
    return Number.isFinite(t) && t >= cutoff;
  });
}

export function addLead(
  lead: Omit<BotLead, "id" | "at" | "status" | "notes" | "tags"> & {
    at?: string;
    status?: LeadStatus;
    notes?: LeadNote[];
    tags?: string[];
    dedupe?: boolean;
  }
): BotLead {
  if (lead.dedupe !== false) {
    const dup = findRecentDuplicate(lead.contact);
    if (dup) return dup;
  }

  const leads = load();
  const entry: BotLead = {
    id: makeId(),
    at: lead.at || new Date().toISOString(),
    status: lead.status || "new",
    chatId: lead.chatId,
    name: lead.name,
    contact: lead.contact,
    task: lead.task,
    fromId: lead.fromId,
    username: lead.username,
    source: lead.source,
    notes: lead.notes || [],
    tags: lead.tags || [],
    remindAt: lead.remindAt,
    assigneeId: lead.assigneeId,
  };
  leads.unshift(entry);
  if (leads.length > MAX_LEADS) leads.length = MAX_LEADS;
  save(leads);
  return entry;
}

export function getLead(id: string): BotLead | undefined {
  return load().find((l) => l.id === id);
}

export function updateLeadStatus(
  id: string,
  status: LeadStatus
): BotLead | undefined {
  const leads = load();
  const lead = leads.find((l) => l.id === id);
  if (!lead) return undefined;
  lead.status = status;
  if (status !== "wait") lead.remindAt = undefined;
  save(leads);
  return lead;
}

export function setLeadRemindAt(
  id: string,
  remindAt: string | undefined
): BotLead | undefined {
  const leads = load();
  const lead = leads.find((l) => l.id === id);
  if (!lead) return undefined;
  lead.remindAt = remindAt;
  if (remindAt) lead.status = "wait";
  save(leads);
  return lead;
}

export function setLeadAssignee(
  id: string,
  assigneeId: number | undefined
): BotLead | undefined {
  const leads = load();
  const lead = leads.find((l) => l.id === id);
  if (!lead) return undefined;
  lead.assigneeId = assigneeId;
  save(leads);
  return lead;
}

export function addLeadNote(
  id: string,
  text: string,
  by?: number
): BotLead | undefined {
  const leads = load();
  const lead = leads.find((l) => l.id === id);
  if (!lead) return undefined;
  if (!lead.notes) lead.notes = [];
  lead.notes.unshift({
    at: new Date().toISOString(),
    by,
    text: text.slice(0, 2000),
  });
  if (lead.notes.length > 30) lead.notes.length = 30;
  save(leads);
  return lead;
}

export function addLeadTag(id: string, tag: string): BotLead | undefined {
  const leads = load();
  const lead = leads.find((l) => l.id === id);
  if (!lead) return undefined;
  const t = tag.trim().toLowerCase().slice(0, 32);
  if (!t) return lead;
  if (!lead.tags) lead.tags = [];
  if (!lead.tags.includes(t)) lead.tags.push(t);
  save(leads);
  return lead;
}

export function listLeads(limit = 10): BotLead[] {
  return load().slice(0, Math.max(1, limit));
}

export function listDueReminders(now = Date.now()): BotLead[] {
  return load().filter((l) => {
    if (!l.remindAt || l.status === "done") return false;
    const t = Date.parse(l.remindAt);
    return Number.isFinite(t) && t <= now;
  });
}

export function searchLeads(query: string, limit = 10): BotLead[] {
  const q = query.trim().toLowerCase();
  if (!q) return listLeads(limit);
  const hits = load().filter((l) => {
    const blob = [
      l.id,
      l.name,
      l.contact,
      l.task,
      l.source,
      l.username,
      ...(l.tags || []),
      ...(l.notes || []).map((n) => n.text),
    ]
      .filter(Boolean)
      .join("\n")
      .toLowerCase();
    return blob.includes(q);
  });
  return hits.slice(0, Math.max(1, limit));
}

export function findLeadByIdPrefix(prefix: string): BotLead | undefined {
  const id = prefix.trim();
  if (!id) return undefined;
  return load().find((l) => l.id === id || l.id.startsWith(id));
}

export function deleteLead(id: string): BotLead | undefined {
  const leads = load();
  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) return undefined;
  const [removed] = leads.splice(idx, 1);
  save(leads);
  return removed;
}

export const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "🆕 Новая",
  progress: "🔄 В работе",
  wait: "⏳ Ждём",
  done: "✅ Закрыта",
};

export function leadStats() {
  const leads = load();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayMsk = formatter.format(new Date());
  const today = leads.filter((l) => {
    try {
      return formatter.format(new Date(l.at)) === todayMsk;
    } catch {
      return false;
    }
  }).length;

  const sources = new Map<string, number>();
  for (const l of leads.slice(0, 100)) {
    const key = (l.source || "unknown").split("|")[0] || "unknown";
    sources.set(key, (sources.get(key) || 0) + 1);
  }
  const topSources = Array.from(sources.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    total: leads.length,
    today,
    new: leads.filter((l) => l.status === "new").length,
    progress: leads.filter((l) => l.status === "progress").length,
    wait: leads.filter((l) => l.status === "wait").length,
    done: leads.filter((l) => l.status === "done").length,
    topSources,
  };
}

export function formatWeeklyDigest() {
  const stats = leadStats();
  const lines = [
    "<b>📊 Недельный срез DevFuture</b>",
    "",
    `Всего заявок в базе: <b>${stats.total}</b>`,
    `Сегодня: <b>${stats.today}</b>`,
    `🆕 ${stats.new} · 🔄 ${stats.progress} · ⏳ ${stats.wait} · ✅ ${stats.done}`,
    "",
    "<b>Топ источников (последние ~100):</b>",
  ];
  if (!stats.topSources.length) {
    lines.push("— пока пусто");
  } else {
    for (const [src, n] of stats.topSources) {
      lines.push(`• <code>${src}</code> — ${n}`);
    }
  }
  return lines.join("\n");
}
