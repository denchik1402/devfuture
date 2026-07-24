"use client";

import { memo } from "react";
import Counter from "./Counter";
import Reveal from "./Reveal";

const STATS = [
  { value: 1, suffix: "", label: "день до MVP / прототипа", prefix: "от " },
  { value: 6, suffix: "", label: "направлений услуг" },
  { value: 1, suffix: "", label: "команда на весь цикл" },
  { value: 100, suffix: "%", label: "код остаётся у вас" },
] as const;

function Stats() {
  return (
    <section id="stats" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
            Доверие
          </p>
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
            Работаем прозрачно и по делу
          </h2>
          <p className="mt-4 max-w-2xl text-zinc-400">
            Компактная команда, прямой контакт и понятная смета — без лишних
            слоёв менеджмента и раздутых сроков.
          </p>
        </Reveal>

        <div className="mt-12 md:mt-14 grid grid-cols-2 items-stretch gap-4 md:grid-cols-4 md:gap-6">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.1} className="h-full">
              <div className="glass group relative flex h-full min-h-[10.5rem] flex-col overflow-hidden rounded-2xl p-6 md:min-h-[11.5rem] md:p-8">
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-neon/10 opacity-50 blur-2xl" />
                <Counter
                  value={stat.value}
                  suffix={stat.suffix}
                  prefix={"prefix" in stat ? stat.prefix : ""}
                  className="font-display text-4xl font-bold text-neon md:text-5xl"
                />
                <p className="mt-3 text-sm leading-snug text-zinc-400 md:text-base">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(Stats);
