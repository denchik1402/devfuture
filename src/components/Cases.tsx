"use client";

import { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock3 } from "lucide-react";
import Reveal from "./Reveal";
import NeonButton from "./NeonButton";
import { DAY_ONE_STEPS, FEATURED_CASE, SCENARIO_CASES } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import { reachGoal } from "@/lib/analytics";

function Cases() {
  return (
    <>
      <section id="day-demo" className="relative py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(0,240,255,0.06),transparent_50%)]" />

        <div className="relative mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
              Результат за день
            </p>
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              Как выглядит демо в день обращения
            </h2>
            <p className="mt-4 max-w-2xl text-zinc-400">
              Для простого бота или прототипа путь короткий: бриф → сценарий →
              рабочее демо. Дальше итерации под ваш процесс.
            </p>
          </Reveal>

          <div className="mt-12 md:mt-14 grid gap-4 md:grid-cols-3">
            {DAY_ONE_STEPS.map((item, i) => (
              <Reveal key={item.step} delay={i * 0.08}>
                <article className="glass relative h-full rounded-2xl p-6">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-xs tracking-[0.25em] text-purple-neon">
                      {item.step}
                    </span>
                    {i === 2 && (
                      <Clock3
                        className="h-4 w-4 text-cyan-neon"
                        strokeWidth={1.5}
                      />
                    )}
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {item.text}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="cases" className="relative py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(176,38,255,0.05),transparent_50%)]" />

        <div className="relative mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
              Кейсы и сценарии
            </p>
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              Примеры с результатом
            </h2>
            <p className="mt-4 max-w-2xl text-zinc-400">
              Откройте карточку услуги или попробуйте{" "}
              <a href="#demo" className="text-cyan-neon hover:underline">
                интерактивное демо бота
              </a>
              .
            </p>
          </Reveal>

          <Reveal className="mt-12 md:mt-14">
            <motion.article
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="glass group relative overflow-hidden rounded-2xl p-7 md:p-8"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-neon/15 via-transparent to-purple-neon/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative flex flex-wrap items-start justify-between gap-3">
                <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-wider text-zinc-500">
                  {FEATURED_CASE.category}
                </span>
                <Link
                  href={FEATURED_CASE.href}
                  aria-label={`Подробнее: ${FEATURED_CASE.title}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-zinc-500 transition-all duration-300 hover:rotate-45 hover:border-cyan-neon/40 hover:text-cyan-neon"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <h3 className="relative mt-6 font-display text-2xl font-semibold text-white md:text-3xl">
                {FEATURED_CASE.title}
              </h3>
              <p className="relative mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400 md:text-base">
                {FEATURED_CASE.description}
              </p>

              <ul className="relative mt-6 grid gap-3 sm:grid-cols-2">
                {FEATURED_CASE.roles.map((role) => (
                  <li
                    key={role.name}
                    className="rounded-xl border border-white/10 bg-void/40 px-4 py-3"
                  >
                    <p className="font-display text-sm font-semibold text-white">
                      {role.name}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                      {role.text}
                    </p>
                  </li>
                ))}
              </ul>

              <p className="relative mt-5 text-sm text-cyan-neon/80">
                Итог: {FEATURED_CASE.result}
              </p>

              <div className="relative mt-6 flex flex-wrap items-center gap-3 border-t border-white/5 pt-5">
                {FEATURED_CASE.stack.map((tech) => (
                  <span key={tech} className="text-xs text-zinc-500">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.article>
          </Reveal>

          <div className="mt-12 md:mt-14 grid gap-5 sm:grid-cols-2">
            {SCENARIO_CASES.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <motion.article
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className="glass group relative flex h-full flex-col overflow-hidden rounded-2xl p-7"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                  />

                  <div className="relative flex items-start justify-between gap-3">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-wider text-zinc-500">
                      {item.category}
                    </span>
                    <Link
                      href={item.href}
                      aria-label={`Подробнее: ${item.title}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-zinc-500 transition-all duration-300 hover:rotate-45 hover:border-cyan-neon/40 hover:text-cyan-neon"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <h3 className="relative mt-8 font-display text-2xl font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="relative mt-3 flex-1 text-sm leading-relaxed text-zinc-400">
                    {item.description}
                  </p>
                  <p className="relative mt-4 text-sm text-cyan-neon/80">
                    Итог: {item.result}
                  </p>

                  <div className="relative mt-6 flex flex-wrap items-center gap-3 border-t border-white/5 pt-5">
                    {item.stack.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs text-zinc-500 transition-colors group-hover:text-cyan-neon/80"
                      >
                        {tech}
                      </span>
                    ))}
                    {item.demoHref && (
                      <a
                        href={item.demoHref}
                        className="ml-auto text-xs text-cyan-neon hover:underline"
                      >
                        Смотреть демо →
                      </a>
                    )}
                  </div>
                </motion.article>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12 md:mt-14">
            <NeonButton
              href={siteConfig.telegramUrl}
              onClick={() => reachGoal("click_telegram", { place: "cases" })}
            >
              Запросить похожий сценарий
            </NeonButton>
          </Reveal>
        </div>
      </section>
    </>
  );
}

export default memo(Cases);
