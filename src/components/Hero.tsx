"use client";

import { memo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import NeonButton from "./NeonButton";
import TechMarquee from "./TechMarquee";
import { telegramBotStartLink } from "@/lib/site";
import { reachGoal } from "@/lib/analytics";
import { SPHERE_BURST_EVENT } from "@/lib/sphere-events";
import { useTheme } from "./ThemeProvider";

const ParticleSphere = dynamic(() => import("./ParticleSphere"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.08),transparent_60%)]" />
  ),
});

function triggerBurst() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SPHERE_BURST_EVENT));
  }
}

function Hero() {
  const { theme } = useTheme();
  const [enableSphere, setEnableSphere] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const conn = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    const slow =
      conn?.saveData ||
      conn?.effectiveType === "2g" ||
      conn?.effectiveType === "slow-2g";
    setEnableSphere(!reduce && !mobile && !slow);
  }, []);

  const vignette =
    theme === "light"
      ? "bg-[radial-gradient(ellipse_at_center,transparent_20%,#e8eef5_90%)]"
      : "bg-[radial-gradient(ellipse_at_center,transparent_30%,#0A0A0A_85%)]";

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="absolute inset-0 bg-void" />
      <div className="absolute inset-0 dot-grid opacity-60" />
      <div className="absolute inset-0 bg-neon-radial" />

      {enableSphere ? (
        <ParticleSphere
          key={theme}
          theme={theme}
          className="absolute inset-0 z-[1] [contain:strict]"
        />
      ) : (
        <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.1),transparent_55%)]" />
      )}

      <div
        className={`pointer-events-none absolute inset-0 z-[2] ${vignette}`}
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-24 text-center">
        <p className="hero-fade-up mb-4 font-display text-xs uppercase tracking-[0.35em] text-cyan-neon/80">
          Цифровые продукты под ключ
        </p>

        <p className="hero-fade-up font-display text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
          Dev<span className="text-neon">Future</span>
        </p>

        <h1 className="hero-fade-up hero-fade-up-delay-1 mt-6 max-w-4xl font-display text-2xl font-semibold leading-snug text-zinc-100 sm:text-3xl md:text-4xl">
          Сайты, боты и автоматизация —{" "}
          <span className="text-neon">с демо часто в день обращения</span>
        </h1>

        <p className="hero-fade-up hero-fade-up-delay-2 mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          Разбираем задачу, фиксируем смету и собираем рабочий продукт без
          лишней сложности.
        </p>

        <div className="hero-fade-up hero-fade-up-delay-3 mt-10 flex flex-wrap items-center justify-center gap-4">
          <span
            onMouseEnter={enableSphere ? triggerBurst : undefined}
            onFocus={enableSphere ? triggerBurst : undefined}
            className="inline-flex"
          >
            <NeonButton
              href={telegramBotStartLink("order")}
              pulse
              onClick={() => reachGoal("click_telegram", { place: "hero" })}
            >
              Написать в Telegram
            </NeonButton>
          </span>
          <NeonButton
            href="#quiz"
            variant="ghost"
            onClick={() => reachGoal("open_contact", { place: "hero_quiz" })}
          >
            Описать задачу
          </NeonButton>
        </div>
      </div>

      <div className="relative z-10 mt-auto">
        <TechMarquee />
      </div>
    </section>
  );
}

export default memo(Hero);
