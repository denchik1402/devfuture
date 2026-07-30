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
  /** Desktop/tablet only — ignore prefers-reduced-motion / Save-Data by product choice */
  const [enableSphere, setEnableSphere] = useState(false);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    setEnableSphere(!mobile);
  }, []);

  const vignette =
    theme === "light"
      ? "bg-[radial-gradient(ellipse_at_center,transparent_38%,#e8f1fb_96%)]"
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
          className="absolute inset-0 z-[1]"
        />
      ) : (
        <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.1),transparent_55%)]" />
      )}

      <div
        className={`pointer-events-none absolute inset-0 z-[2] ${vignette}`}
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-24 text-center">
        <p className="hero-fade-up font-display text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
          Dev<span className="text-neon">Future</span>
        </p>

        <h1 className="hero-fade-up hero-fade-up-delay-1 mt-6 max-w-4xl font-display text-2xl font-semibold leading-snug text-zinc-100 sm:text-3xl md:text-4xl">
          Мы решаем задачи,{" "}
          <span className="text-neon">которые не могут другие</span>
        </h1>

        <p className="hero-fade-up hero-fade-up-delay-2 mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          Сайты, веб-приложения, Telegram-боты, автоматизация и AI — под ключ.
          Простой бот или MVP можем показать уже в день обращения: ценим ваше
          время.
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
