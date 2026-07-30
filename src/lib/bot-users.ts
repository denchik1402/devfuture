import { existsSync, readFileSync } from "fs";
import path from "path";
import { atomicWriteJson } from "@/lib/atomic-write";

/** Users who opened the bot — for admin broadcast */
const dataDir = path.join(process.cwd(), ".data");
const usersFile = path.join(dataDir, "bot-users.json");
const MAX_USERS = 2000;

type UserRow = { chatId: number; at: string; username?: string };

let cache: Map<number, UserRow> | null = null;

function load(): Map<number, UserRow> {
  if (cache) return cache;
  cache = new Map();
  try {
    if (!existsSync(usersFile)) return cache;
    const raw = JSON.parse(readFileSync(usersFile, "utf8")) as UserRow[];
    if (Array.isArray(raw)) {
      for (const row of raw) {
        if (row?.chatId) cache.set(row.chatId, row);
      }
    }
  } catch (err) {
    console.error("[bot-users] load failed", err);
  }
  return cache;
}

function save(map: Map<number, UserRow>) {
  cache = map;
  try {
    const list = Array.from(map.values())
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, MAX_USERS);
    atomicWriteJson(usersFile, list);
  } catch (err) {
    console.error("[bot-users] save failed", err);
  }
}

export function touchUser(chatId: number, username?: string) {
  const map = load();
  map.set(chatId, {
    chatId,
    at: new Date().toISOString(),
    username: username || map.get(chatId)?.username,
  });
  save(map);
}

export function listUserChatIds(): number[] {
  return Array.from(load().keys());
}

export function usersCount(): number {
  return load().size;
}
