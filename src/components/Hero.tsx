"use client";

import { memo } from "react";
import dynamic from "next/dynamic";
import NeonButton from "./NeonButton";
import TechMarquee from "./TechMarquee";
import { siteConfig } from "@/lib/site";
import { reachGoal } from "@/lib/analytics";
import { SPHERE_BURST_EVENT } from "@/lib/sphere-events";

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
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="absolute inset-0 bg-void" />
      <div className="absolute inset-0 dot-grid opacity-60" />
      <div className="absolute inset-0 bg-neon-radial" />

      <ParticleSphere className="absolute inset-0 z-[1] [contain:strict]" />

      <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,transparent_30%,#0A0A0A_85%)]" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-24 text-center">
        <p className="hero-fade-up mb-6 font-display text-xs uppercase tracking-[0.35em] text-cyan-neon/80">
          DevFuture · цифровые продукты
        </p>

        <h1 className="hero-fade-up hero-fade-up-delay-1 max-w-5xl font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          МЫ РЕШАЕМ ЗАДАЧИ,
          <br />
          <span className="text-neon">КОТОРЫЕ НЕ МОГУТ ДРУГИЕ</span>
        </h1>

        <p className="hero-fade-up hero-fade-up-delay-2 mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          Сайты, веб-приложения, десктопные программы, Telegram-боты,
          автоматизация и AI — под ключ. Простой бот или MVP можем показать уже
          в день обращения
        </p>

        <div className="hero-fade-up hero-fade-up-delay-3 mt-10 flex flex-wrap items-center justify-center gap-4">
          <span
            onMouseEnter={triggerBurst}
            onFocus={triggerBurst}
            className="inline-flex"
          >
            <NeonButton
              href={siteConfig.telegramUrl}
              pulse
              onClick={() => reachGoal("click_telegram", { place: "hero" })}
            >
              Обсудить проект
            </NeonButton>
          </span>
          <NeonButton href="#packages" variant="ghost">
            Пакеты и сроки
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
