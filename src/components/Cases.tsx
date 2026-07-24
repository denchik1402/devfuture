"use client";

import { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock3 } from "lucide-react";
import Reveal from "./Reveal";
import NeonButton from "./NeonButton";
import {
  DAY_ONE_STEPS,
  REAL_CASES,
  SCENARIO_CASES,
} from "@/lib/content";
import { siteConfig } from "@/lib/site";
import { reachGoal } from "@/lib/analytics";

function Cases() {
  return (
    <section id="cases" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(0,240,255,0.06),transparent_50%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
            Кейсы
          </p>
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
            Было → сделали → результат
          </h2>
          <p className="mt-4 max-w-2xl text-zinc-400">
            Анонимизированные истории с конкретным эффектом. Похожий сценарий
            можем разобрать под ваш процесс в Telegram.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {REAL_CASES.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <article className="glass flex h-full flex-col rounded-2xl p-6">
                <h3 className="font-display text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <dl className="mt-5 space-y-4 text-sm">
                  <div>
                    <dt className="text-[11px] uppercase tracking-wider text-zinc-500">
                      Было
                    </dt>
                    <dd className="mt-1 text-zinc-400">{item.before}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wider text-zinc-500">
                      Сделали
                    </dt>
                    <dd className="mt-1 text-zinc-300">{item.did}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wider text-cyan-neon/70">
                      Результат
                    </dt>
                    <dd className="mt-1 font-medium text-cyan-neon">
                      {item.result}
                    </dd>
                  </div>
                </dl>
                <p className="mt-auto pt-5 text-xs text-zinc-500">{item.term}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-20">
          <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
            Результат за день
          </p>
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
            Как выглядит демо в день обращения
          </h2>
          <p className="mt-4 max-w-2xl text-zinc-400">
            Для простого бота или прототипа путь короткий: бриф → сценарий →
            рабочее демо.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
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

        <Reveal className="mt-20">
          <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
            Сценарии
          </p>
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
            Примеры сценариев
          </h2>
          <p className="mt-4 max-w-2xl text-zinc-400">
            Откройте карточку услуги или попробуйте{" "}
            <a href="#demo" className="text-cyan-neon hover:underline">
              интерактивное демо бота
            </a>
            .
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
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

        <Reveal className="mt-10">
          <NeonButton
            href={siteConfig.telegramUrl}
            onClick={() => reachGoal("click_telegram", { place: "cases" })}
          >
            Запросить похожий сценарий
          </NeonButton>
        </Reveal>
      </div>
    </section>
  );
}

export default memo(Cases);
