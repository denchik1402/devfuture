import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

export type LeadStatus = "new" | "progress" | "done";

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
};

const dataDir = path.join(process.cwd(), ".data");
const leadsFile = path.join(dataDir, "bot-leads.json");
const MAX_LEADS = 500;

let cache: BotLead[] | null = null;

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
          status: l.status || "new",
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
    if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
    writeFileSync(leadsFile, JSON.stringify(leads, null, 2), "utf8");
  } catch (err) {
    console.error("[bot-leads] save failed", err);
  }
}

function makeId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function addLead(
  lead: Omit<BotLead, "id" | "at" | "status"> & {
    at?: string;
    status?: LeadStatus;
  }
) {
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
  save(leads);
  return lead;
}

export function listLeads(limit = 10): BotLead[] {
  return load().slice(0, Math.max(1, limit));
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
  const todayMsk = formatter.format(new Date()); // YYYY-MM-DD
  const today = leads.filter((l) => {
    try {
      return formatter.format(new Date(l.at)) === todayMsk;
    } catch {
      return false;
    }
  }).length;
  return {
    total: leads.length,
    today,
    new: leads.filter((l) => l.status === "new").length,
    progress: leads.filter((l) => l.status === "progress").length,
    done: leads.filter((l) => l.status === "done").length,
  };
}
