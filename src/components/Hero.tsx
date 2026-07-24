"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import NeonButton from "./NeonButton";
import TechMarquee from "./TechMarquee";
import { siteConfig } from "@/lib/site";

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

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-void" />
      <div className="absolute inset-0 dot-grid opacity-60" />
      <div className="absolute inset-0 bg-neon-radial" />

      <ParticleSphere className="absolute inset-0 z-[1] h-full w-full" />

      <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,transparent_30%,#0A0A0A_85%)]" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
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
          className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl max-w-5xl"
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
          className="mt-6 max-w-2xl text-base text-zinc-400 sm:text-lg leading-relaxed"
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
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <NeonButton href={siteConfig.telegramUrl} pulse>
            Обсудить проект
          </NeonButton>
          <NeonButton href="#packages" variant="ghost">
            Пакеты и сроки
          </NeonButton>
        </motion.div>
      </div>

      <div className="relative z-10 mt-auto">
        <TechMarquee />
      </div>
    </section>
  );
}

export default memo(Hero);
