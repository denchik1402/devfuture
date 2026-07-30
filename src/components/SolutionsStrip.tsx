"use client";

import { memo } from "react";
import Link from "next/link";
import Reveal from "./Reveal";
import { SEO_LANDINGS } from "@/lib/seo-landings";

function SolutionsStrip() {
  return (
    <section id="solutions" className="relative py-16 md:py-20">
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
            Решения
          </p>
          <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
            Готовые сценарии под задачу
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-zinc-400">
            Посадочные страницы с разбором формата — от бота заявок до лендинга
            и кабинета.
          </p>
        </Reveal>

        <ul className="mt-8 flex flex-wrap gap-2">
          {SEO_LANDINGS.map((l) => (
            <li key={l.slug}>
              <Link
                href={`/resheniya/${l.slug}`}
                className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm text-zinc-300 transition hover:border-cyan-neon/40 hover:text-cyan-neon"
              >
                {l.h1}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default memo(SolutionsStrip);
