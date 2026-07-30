"use client";

import { useEffect, useState } from "react";

export type TgWebAppUser = {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
};

type TgWebApp = {
  ready: () => void;
  expand: () => void;
  close: () => void;
  themeParams?: Record<string, string>;
  colorScheme?: "light" | "dark";
  initData?: string;
  initDataUnsafe?: { user?: TgWebAppUser };
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy") => void;
  };
  MainButton?: {
    text: string;
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TgWebApp };
  }
}

export function useTelegramWebApp() {
  const [webApp, setWebApp] = useState<TgWebApp | null>(null);
  const [user, setUser] = useState<TgWebAppUser | null>(null);
  const [initData, setInitData] = useState("");

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;
    try {
      tg.ready();
      tg.expand();
      tg.setHeaderColor?.("#0a0a0a");
      tg.setBackgroundColor?.("#0a0a0a");
    } catch {
      /* ignore */
    }
    setWebApp(tg);
    setUser(tg.initDataUnsafe?.user ?? null);
    setInitData(tg.initData || "");
  }, []);

  return { webApp, user, initData };
}
