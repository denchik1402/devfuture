"use client";

import { memo, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import NeonButton from "./NeonButton";
import TechMarquee from "./TechMarquee";
import HeroMedia from "./HeroMedia";
import { siteConfig } from "@/lib/site";
import { reachGoal } from "@/lib/analytics";
import { SPHERE_BURST_EVENT } from "@/lib/sphere-events";

const ParticleSphere = dynamic(() => import("./ParticleSphere"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.08),transparent_60%)]" />
  ),
});

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 18,
      delay: 0.2 + i * 0.2,
    },
  }),
};

function triggerBurst() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SPHERE_BURST_EVENT));
  }
}

function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 20 });
  const sy = useSpring(my, { stiffness: 50, damping: 20 });
  const textX = useTransform(sx, [-1, 1], [-12, 12]);
  const textY = useTransform(sy, [-1, 1], [8, -8]);
  const gridX = useTransform(sx, [-1, 1], [-20, 20]);
  const gridY = useTransform(sy, [-1, 1], [12, -12]);
  const [showMedia, setShowMedia] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    const t = window.setTimeout(() => setShowMedia(true), 600);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.clearTimeout(t);
    };
  }, [mx, my]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen flex-col overflow-hidden"
    >
      <div className="absolute inset-0 bg-void" />
      <motion.div
        className="absolute inset-0 dot-grid opacity-60"
        style={{ x: gridX, y: gridY }}
      />
      <div className="absolute inset-0 bg-neon-radial" />

      <ParticleSphere className="absolute inset-0 z-[1] [contain:strict]" />

      <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,transparent_30%,#0A0A0A_85%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-10 px-6 pt-24 pb-16 lg:flex-row lg:items-center lg:justify-between lg:text-left">
        <motion.div
          className="flex flex-col items-center text-center lg:max-w-xl lg:items-start lg:text-left"
          style={{ x: textX, y: textY }}
        >
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mb-6 font-display text-xs uppercase tracking-[0.35em] text-cyan-neon/80"
          >
            DevFuture · цифровые продукты
          </motion.p>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="max-w-5xl font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl"
          >
            МЫ РЕШАЕМ ЗАДАЧИ,
            <br />
            <span className="text-neon">КОТОРЫЕ НЕ МОГУТ ДРУГИЕ</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg"
          >
            Сайты, веб-приложения, десктопные программы, Telegram-боты,
            автоматизация и AI — под ключ. Простой бот или MVP можем показать
            уже в день обращения
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
          >
            <span
              onMouseEnter={triggerBurst}
              onFocus={triggerBurst}
              className="inline-flex"
            >
              <NeonButton
                href={siteConfig.telegramUrl}
                pulse
                onClick={() =>
                  reachGoal("click_telegram", { place: "hero" })
                }
              >
                Обсудить проект
              </NeonButton>
            </span>
            <NeonButton href="#demo" variant="ghost">
              Смотреть демо
            </NeonButton>
          </motion.div>
        </motion.div>

        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="hidden w-full max-w-sm shrink-0 lg:block"
        >
          {showMedia && <HeroMedia />}
        </motion.div>
      </div>

      <div className="relative z-10 mt-auto">
        <TechMarquee />
      </div>
    </section>
  );
}

export default memo(Hero);
