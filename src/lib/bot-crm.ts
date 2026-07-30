import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import type { BotLead } from "@/lib/bot-leads";

type CrmJob = {
  id: string;
  at: string;
  attempts: number;
  nextAt: string;
  payload: Record<string, unknown>;
};

const dataDir = path.join(process.cwd(), ".data");
const queueFile = path.join(dataDir, "crm-queue.json");
const MAX_ATTEMPTS = 8;
const MAX_QUEUE = 200;

let cache: CrmJob[] | null = null;
let flushing = false;

function load(): CrmJob[] {
  if (cache) return cache;
  try {
    if (!existsSync(queueFile)) {
      cache = [];
      return cache;
    }
    const raw = JSON.parse(readFileSync(queueFile, "utf8")) as CrmJob[];
    cache = Array.isArray(raw) ? raw : [];
  } catch (err) {
    console.error("[bot-crm] queue load failed", err);
    cache = [];
  }
  return cache;
}

function save(jobs: CrmJob[]) {
  cache = jobs;
  try {
    if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
    writeFileSync(queueFile, JSON.stringify(jobs, null, 2), "utf8");
  } catch (err) {
    console.error("[bot-crm] queue save failed", err);
  }
}

function webhookUrl() {
  return process.env["LEADS_WEBHOOK_URL"]?.trim() || "";
}

function backoffMs(attempts: number) {
  // 30s, 2m, 8m, 30m, 2h, 6h, 12h, 24h (capped)
  const mins = [0.5, 2, 8, 30, 120, 360, 720, 1440];
  const m = mins[Math.min(attempts, mins.length - 1)] ?? 1440;
  return m * 60_000;
}

async function postPayload(payload: Record<string, unknown>) {
  const url = webhookUrl();
  if (!url) return { ok: true as const, skipped: true };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) {
    return { ok: false as const, status: res.status };
  }
  return { ok: true as const };
}

function enqueue(payload: Record<string, unknown>) {
  const jobs = load();
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  jobs.push({
    id,
    at: new Date().toISOString(),
    attempts: 0,
    nextAt: new Date().toISOString(),
    payload,
  });
  if (jobs.length > MAX_QUEUE) {
    jobs.splice(0, jobs.length - MAX_QUEUE);
  }
  save(jobs);
}

/** Drain due CRM jobs (best-effort, non-blocking callers). */
export async function flushCrmQueue() {
  if (!webhookUrl() || flushing) return;
  flushing = true;
  try {
    const now = Date.now();
    const jobs = load();
    const remaining: CrmJob[] = [];

    for (const job of jobs) {
      const due = Date.parse(job.nextAt) <= now;
      if (!due) {
        remaining.push(job);
        continue;
      }
      try {
        const result = await postPayload(job.payload);
        if (result.ok) continue;
        job.attempts += 1;
        if (job.attempts >= MAX_ATTEMPTS) {
          console.error(
            "[bot-crm] giving up job",
            job.id,
            "after",
            job.attempts,
            "attempts"
          );
          continue;
        }
        job.nextAt = new Date(now + backoffMs(job.attempts)).toISOString();
        remaining.push(job);
        console.error(
          "[bot-crm] retry scheduled",
          job.id,
          "attempt",
          job.attempts,
          "next",
          job.nextAt
        );
      } catch (err) {
        job.attempts += 1;
        if (job.attempts >= MAX_ATTEMPTS) {
          console.error("[bot-crm] giving up job", job.id, err);
          continue;
        }
        job.nextAt = new Date(now + backoffMs(job.attempts)).toISOString();
        remaining.push(job);
        const message = err instanceof Error ? err.message : String(err);
        console.error("[bot-crm] retry after error:", message);
      }
    }

    save(remaining);
  } finally {
    flushing = false;
  }
}

/**
 * Optional CRM hook: POST each lead to Make / Zapier / Sheets / Notion.
 * Set LEADS_WEBHOOK_URL in .env.local. Failed posts go to .data/crm-queue.json.
 */
export async function pushLeadToCrm(lead: BotLead) {
  const payload = {
    event: "telegram_lead",
    ...lead,
    sentAt: new Date().toISOString(),
  };
  if (!webhookUrl()) return;

  try {
    const result = await postPayload(payload);
    if (!result.ok) {
      console.error("[bot-crm] webhook status", result.status);
      enqueue(payload);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[bot-crm] webhook error:", message);
    enqueue(payload);
  }
  void flushCrmQueue();
}

export async function pushLeadStatusToCrm(
  lead: BotLead,
  prevStatus: string
) {
  const payload = {
    event: "telegram_lead_status",
    id: lead.id,
    status: lead.status,
    prevStatus,
    name: lead.name,
    chatId: lead.chatId,
    sentAt: new Date().toISOString(),
  };
  if (!webhookUrl()) return;

  try {
    const result = await postPayload(payload);
    if (!result.ok) {
      console.error("[bot-crm] status webhook status", result.status);
      enqueue(payload);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[bot-crm] status webhook error:", message);
    enqueue(payload);
  }
  void flushCrmQueue();
}

export function crmQueueStats() {
  const jobs = load();
  return { pending: jobs.length };
}
