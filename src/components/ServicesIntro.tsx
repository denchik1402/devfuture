"use client";

import { memo } from "react";
import Link from "next/link";
import Reveal from "./Reveal";
import { SERVICE_PAGES } from "@/lib/services";
import { siteConfig } from "@/lib/site";
import { reachGoal } from "@/lib/analytics";

function ServicesIntro() {
  return (
    <section id="services" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-20" />

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
            Услуги
          </p>
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
            IT-студия {siteConfig.name}
          </h2>
          <p className="mt-4 max-w-3xl text-zinc-400 leading-relaxed">
            {siteConfig.description} Сначала разбираем процесс и требования —
            потом пишем код. Так продукт получается быстрее и без лишней
            сложности.
          </p>
        </Reveal>

        <div className="mt-12 md:mt-14 grid auto-rows-fr gap-5 sm:grid-cols-2">
          {SERVICE_PAGES.map((s, i) => (
            <Reveal key={s.slug} delay={i * 0.06} className="h-full">
              <Link
                href={`/uslugi/${s.slug}`}
                onClick={() =>
                  reachGoal("open_service", { slug: s.slug })
                }
                className="glass flex h-full flex-col rounded-2xl p-6 transition hover:border-cyan-neon/40 hover:shadow-[0_0_28px_rgba(0,240,255,0.1)]"
              >
                <h3 className="font-display text-lg font-semibold text-white">
                  {s.name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">
                  {s.description}
                </p>
                <p className="mt-4 text-xs uppercase tracking-wider text-cyan-neon/70">
                  от {s.priceFrom} →
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(ServicesIntro);
