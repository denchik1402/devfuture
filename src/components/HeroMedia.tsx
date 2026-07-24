"use client";

import { memo, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Desktop hero media: loops /demo-hero.webm when present,
 * otherwise a sound-off animated Telegram-style chat mock.
 */
function HeroMedia() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useVideo, setUseVideo] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onReady = () => setUseVideo(true);
    const onFail = () => setUseVideo(false);
    v.addEventListener("loadeddata", onReady);
    v.addEventListener("error", onFail);
    v.load();
    return () => {
      v.removeEventListener("loadeddata", onReady);
      v.removeEventListener("error", onFail);
    };
  }, []);

  useEffect(() => {
    if (useVideo) return;
    const id = window.setInterval(() => {
      setStep((s) => (s + 1) % 4);
    }, 1600);
    return () => window.clearInterval(id);
  }, [useVideo]);

  const lines = [
    { who: "bot", text: "Выберите услугу:" },
    { who: "user", text: "Стрижка" },
    { who: "bot", text: "Завтра 12:00 — свободно. Записать?" },
    { who: "bot", text: "Готово. Заявка у администратора." },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_0_60px_rgba(0,240,255,0.08)]">
      <div className="mb-3 flex items-center gap-2 border-b border-white/5 pb-3">
        <span className="h-2 w-2 rounded-full bg-cyan-neon" />
        <span className="font-display text-[11px] uppercase tracking-[0.2em] text-zinc-500">
          Демо · Telegram-бот
        </span>
      </div>

      <video
        ref={videoRef}
        className={`aspect-[9/14] w-full rounded-xl object-cover ${
          useVideo ? "block" : "hidden"
        }`}
        src="/demo-hero.webm"
        poster="/demo-hero-poster.svg"
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
      />

      {!useVideo && (
        <div className="flex aspect-[9/14] flex-col gap-2.5 rounded-xl bg-void/80 p-3">
          <AnimatePresence mode="popLayout">
            {lines.slice(0, step + 1).map((line, i) => (
              <motion.div
                key={`${line.text}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-snug ${
                  line.who === "bot"
                    ? "self-start border border-white/10 bg-white/5 text-zinc-200"
                    : "self-end bg-cyan-neon/15 text-cyan-neon"
                }`}
              >
                {line.text}
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="mt-auto flex gap-2 pt-2">
            {["Стрижка", "Маникюр", "Консульт."].map((b) => (
              <span
                key={b}
                className="rounded-full border border-cyan-neon/25 px-2.5 py-1 text-[10px] text-cyan-neon/80"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(HeroMedia);
