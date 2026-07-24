"use client";

import { memo, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, PenTool, Code2, Headphones } from "lucide-react";
import Reveal from "./Reveal";

const STEPS = [
  {
    num: "01",
    title: "Анализ",
    description:
      "Сначала разбираем процесс и требования — потом код. Фиксируем цели, ограничения и критерии готовности в понятном ТЗ.",
    icon: Search,
  },
  {
    num: "02",
    title: "Прототип",
    description:
      "Быстрый MVP: простые сценарии и боты часто показываем в тот же день или на следующий. Смотрите, правите, утверждаете — и идём в доработку.",
    icon: PenTool,
  },
  {
    num: "03",
    title: "Разработка",
    description:
      "Делаем короткими итерациями с демо. Прозрачный статус, без сюрпризов в конце спринта.",
    icon: Code2,
  },
  {
    num: "04",
    title: "Поддержка",
    description:
      "Релиз, мелкие правки, обновления и развитие. Остаёмся на связи, пока продукту нужна команда.",
    icon: Headphones,
  },
];

function Process() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.7", "end 0.4"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="process" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-25" />

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
            Процесс
          </p>
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
            Как мы работаем
          </h2>
          <p className="mt-4 max-w-xl text-zinc-400">
            От формулировки задачи до сопровождения — один процесс, без потери
            контекста между этапами.
          </p>
        </Reveal>

        <div ref={containerRef} className="relative mt-16 md:mt-20">
          {/* Vertical timeline line (desktop) — scaleY is GPU-composited */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10 md:left-1/2 md:-translate-x-px hidden sm:block">
            <motion.div
              style={{ scaleY: lineScale }}
              className="h-full w-full origin-top bg-neon-gradient will-change-transform"
            />
          </div>

          <div className="space-y-12 md:space-y-0">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isLeft = i % 2 === 0;

              return (
                <Reveal key={step.num} delay={i * 0.08}>
                  <div
                    className={`relative grid md:grid-cols-2 md:gap-16 items-center ${
                      i > 0 ? "md:mt-20" : ""
                    }`}
                  >
                    {/* Dot on timeline */}
                    <div className="absolute left-6 top-8 z-10 hidden h-3 w-3 -translate-x-1/2 rounded-full border-2 border-cyan-neon bg-void shadow-neon sm:block md:left-1/2" />

                    <div
                      className={`${
                        isLeft
                          ? "md:col-start-1 md:pr-12 md:text-right"
                          : "md:col-start-2 md:pl-12"
                      } pl-14 sm:pl-16 md:pl-0`}
                    >
                      <div
                        className={`glass inline-flex w-full max-w-md flex-col rounded-2xl p-6 md:p-7 ${
                          isLeft ? "md:ml-auto" : ""
                        }`}
                      >
                        <div
                          className={`flex items-center gap-3 ${
                            isLeft ? "md:flex-row-reverse" : ""
                          }`}
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-cyan-neon">
                            <Icon className="h-5 w-5" strokeWidth={1.5} />
                          </span>
                          <span className="font-display text-xs tracking-[0.25em] text-purple-neon">
                            {step.num}
                          </span>
                        </div>
                        <h3 className="mt-4 font-display text-xl font-semibold text-white">
                          {step.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(Process);
