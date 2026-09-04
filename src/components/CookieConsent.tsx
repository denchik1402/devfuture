"use client";

import { memo, useEffect, useState } from "react";
import Link from "next/link";
import {
  readCookieConsent,
  writeCookieConsent,
} from "@/lib/cookie-consent";

function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readCookieConsent() === null);
  }, []);

  if (!visible) return null;

  const accept = () => {
    writeCookieConsent("accepted");
    setVisible(false);
  };

  const reject = () => {
    writeCookieConsent("rejected");
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Согласие на cookie и аналитику"
      className="fixed inset-x-0 bottom-0 z-[70] p-4 sm:p-6"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-white/10 bg-void/95 p-5 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-md sm:flex-row sm:items-center sm:gap-6">
        <p className="flex-1 text-sm leading-relaxed text-zinc-300">
          Мы используем необходимые cookie для работы сайта. Аналитика (Яндекс
          Метрика) включается только после вашего согласия.{" "}
          <Link href="/privacy" className="text-cyan-neon hover:underline">
            Политика конфиденциальности
          </Link>
          .
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={reject}
            className="rounded-full border border-white/15 px-4 py-2.5 text-sm text-zinc-300 transition hover:border-white/30 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon"
          >
            Только необходимые
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-full bg-neon-gradient px-4 py-2.5 text-sm font-semibold text-void shadow-neon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon"
          >
            Принять
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(CookieConsent);
