import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

export type AdminSession =
  | { type: "reply"; targetChatId: number; leadId?: string }
  | { type: "broadcast"; text?: string };

const dataDir = path.join(process.cwd(), ".data");
const file = path.join(dataDir, "bot-admin-sessions.json");

let cache: Map<number, AdminSession> | null = null;

function load(): Map<number, AdminSession> {
  if (cache) return cache;
  cache = new Map();
  try {
    if (!existsSync(file)) return cache;
    const raw = JSON.parse(readFileSync(file, "utf8")) as Record<
      string,
      AdminSession
    >;
    for (const [id, session] of Object.entries(raw)) {
      const n = Number(id);
      if (Number.isFinite(n) && session?.type) cache.set(n, session);
    }
  } catch (err) {
    console.error("[bot-admin-sessions] load failed", err);
  }
  return cache;
}

function save(map: Map<number, AdminSession>) {
  cache = map;
  try {
    if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
    const obj: Record<string, AdminSession> = {};
    for (const [id, session] of Array.from(map.entries())) {
      obj[String(id)] = session;
    }
    writeFileSync(file, JSON.stringify(obj), "utf8");
  } catch (err) {
    console.error("[bot-admin-sessions] save failed", err);
  }
}

export function getAdminSession(adminId: number) {
  return load().get(adminId);
}

export function setAdminSession(adminId: number, session: AdminSession) {
  const map = load();
  map.set(adminId, session);
  save(map);
}

export function clearAdminSession(adminId: number) {
  const map = load();
  map.delete(adminId);
  save(map);
}
