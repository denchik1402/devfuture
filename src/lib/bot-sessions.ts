import { existsSync, readFileSync } from "fs";
import path from "path";
import { atomicWriteJson } from "@/lib/atomic-write";

export type BotSession =
  | { type: "reply"; targetChatId: number; leadId?: string }
  | { type: "broadcast"; text?: string }
  | { type: "ask" }
  | { type: "note"; leadId: string }
  | { type: "find" };

const dataDir = path.join(process.cwd(), ".data");
const file = path.join(dataDir, "bot-admin-sessions.json");

let cache: Map<number, BotSession> | null = null;

function load(): Map<number, BotSession> {
  if (cache) return cache;
  cache = new Map();
  try {
    if (!existsSync(file)) return cache;
    const raw = JSON.parse(readFileSync(file, "utf8")) as Record<
      string,
      BotSession
    >;
    for (const [id, session] of Object.entries(raw)) {
      const n = Number(id);
      if (Number.isFinite(n) && session?.type) cache.set(n, session);
    }
  } catch (err) {
    console.error("[bot-sessions] load failed", err);
  }
  return cache;
}

function save(map: Map<number, BotSession>) {
  cache = map;
  try {
    const obj: Record<string, BotSession> = {};
    for (const [id, session] of Array.from(map.entries())) {
      obj[String(id)] = session;
    }
    atomicWriteJson(file, obj);
  } catch (err) {
    console.error("[bot-sessions] save failed", err);
  }
}

export function getSession(chatOrUserId: number) {
  return load().get(chatOrUserId);
}

export function setSession(chatOrUserId: number, session: BotSession) {
  const map = load();
  map.set(chatOrUserId, session);
  save(map);
}

export function clearSession(chatOrUserId: number) {
  const map = load();
  map.delete(chatOrUserId);
  save(map);
}

/** @deprecated use getSession */
export const getAdminSession = getSession;
/** @deprecated use setSession */
export const setAdminSession = setSession;
/** @deprecated use clearSession */
export const clearAdminSession = clearSession;
