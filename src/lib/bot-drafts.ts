import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

export type LeadDraft = {
  step: "name" | "contact" | "task";
  name?: string;
  contact?: string;
};

const memory = new Map<number, LeadDraft>();
const dataDir = path.join(process.cwd(), ".data");
const draftFile = path.join(dataDir, "bot-drafts.json");

let hydrated = false;

function hydrate() {
  if (hydrated) return;
  hydrated = true;
  try {
    if (!existsSync(draftFile)) return;
    const raw = JSON.parse(readFileSync(draftFile, "utf8")) as Record<
      string,
      LeadDraft
    >;
    for (const [id, draft] of Object.entries(raw)) {
      const n = Number(id);
      if (Number.isFinite(n) && draft?.step) memory.set(n, draft);
    }
  } catch (err) {
    console.error("[bot-drafts] hydrate failed", err);
  }
}

function persist() {
  try {
    if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
    const obj: Record<string, LeadDraft> = {};
    for (const [id, draft] of Array.from(memory.entries())) {
      obj[String(id)] = draft;
    }
    writeFileSync(draftFile, JSON.stringify(obj), "utf8");
  } catch (err) {
    console.error("[bot-drafts] persist failed", err);
  }
}

export function getDraft(chatId: number): LeadDraft | undefined {
  hydrate();
  return memory.get(chatId);
}

export function setDraft(chatId: number, draft: LeadDraft) {
  hydrate();
  memory.set(chatId, draft);
  persist();
}

export function deleteDraft(chatId: number) {
  hydrate();
  memory.delete(chatId);
  persist();
}
