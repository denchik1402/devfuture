"use client";

import { memo } from "react";
import Reveal from "./Reveal";
import { PACKAGES } from "@/lib/content";

function PackageCompare() {
  return (
    <section id="compare" className="relative py-16 md:py-24">
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
            Сравнение
          </p>
          <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
            Пакеты рядом
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-zinc-400">
            Кратко: цена «от», срок/формат и ключевые пункты состава.
          </p>
        </Reveal>

        <Reveal delay={0.06} className="mt-8">
          <div className="glass overflow-x-auto rounded-2xl">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3 font-medium md:px-5">Пакет</th>
                  <th className="px-4 py-3 font-medium md:px-5">От</th>
                  <th className="px-4 py-3 font-medium md:px-5">Формат</th>
                  <th className="px-4 py-3 font-medium md:px-5">Входит</th>
                </tr>
              </thead>
              <tbody>
                {PACKAGES.map((pkg) => (
                  <tr
                    key={pkg.id}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="px-4 py-4 align-top font-display font-semibold text-white md:px-5">
                      {pkg.name}
                    </td>
                    <td className="px-4 py-4 align-top text-neon md:px-5">
                      {pkg.priceFrom}
                    </td>
                    <td className="px-4 py-4 align-top text-zinc-400 md:px-5">
                      {pkg.badge}
                    </td>
                    <td className="px-4 py-4 align-top text-zinc-400 md:px-5">
                      <ul className="space-y-1">
                        {pkg.includes.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default memo(PackageCompare);
