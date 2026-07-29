import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

export type BotLead = {
  id: string;
  at: string;
  chatId: number;
  name: string;
  contact: string;
  task: string;
  fromId?: number;
  username?: string;
};

const dataDir = path.join(process.cwd(), ".data");
const leadsFile = path.join(dataDir, "bot-leads.json");
const MAX_LEADS = 200;

let cache: BotLead[] | null = null;

function load(): BotLead[] {
  if (cache) return cache;
  try {
    if (!existsSync(leadsFile)) {
      cache = [];
      return cache;
    }
    const raw = JSON.parse(readFileSync(leadsFile, "utf8")) as BotLead[];
    cache = Array.isArray(raw) ? raw : [];
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

export function addLead(lead: Omit<BotLead, "id" | "at"> & { at?: string }) {
  const leads = load();
  const entry: BotLead = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: lead.at || new Date().toISOString(),
    chatId: lead.chatId,
    name: lead.name,
    contact: lead.contact,
    task: lead.task,
    fromId: lead.fromId,
    username: lead.username,
  };
  leads.unshift(entry);
  if (leads.length > MAX_LEADS) leads.length = MAX_LEADS;
  save(leads);
  return entry;
}

export function listLeads(limit = 10): BotLead[] {
  return load().slice(0, Math.max(1, limit));
}

export function leadStats() {
  const leads = load();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayIso = startOfDay.toISOString();
  const today = leads.filter((l) => l.at >= todayIso).length;
  return { total: leads.length, today };
}
