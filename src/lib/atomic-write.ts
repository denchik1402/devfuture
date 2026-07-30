import { existsSync, mkdirSync, renameSync, writeFileSync } from "fs";
import path from "path";

/** Atomic JSON write: temp file in same dir + rename */
export function atomicWriteJson(filePath: string, data: unknown) {
  const dir = path.dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  renameSync(tmp, filePath);
}
