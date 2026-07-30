"use client";

declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: unknown[]) => void;
  }
}

export type MetrikaGoal =
  | "click_telegram"
  | "click_phone"
  | "submit_brief"
  | "open_packages"
  | "open_service"
  | "open_demo"
  | "click_package"
  | "scroll_75"
  | "quiz_complete"
  | "open_contact"
  | "lead_handoff"
  | "open_estimator"
  | "view_resheniya"
  | "view_case"
  | "view_blog";

export function getMetrikaId(): number | null {
  const raw = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function reachGoal(goal: MetrikaGoal, params?: Record<string, string>) {
  const id = getMetrikaId();
  if (!id || typeof window === "undefined" || typeof window.ym !== "function") {
    return;
  }
  try {
    window.ym(id, "reachGoal", goal, params);
  } catch {
    // ignore analytics errors
  }
}
