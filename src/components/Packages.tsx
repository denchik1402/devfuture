"use client";

import { memo } from "react";
import { Check } from "lucide-react";
import Reveal from "./Reveal";
import NeonButton from "./NeonButton";
import { PACKAGES } from "@/lib/content";
import { telegramBotStartLink } from "@/lib/site";
import { reachGoal } from "@/lib/analytics";

function Packages() {
  return (
    <section id="packages" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.05),transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
            Пакеты
          </p>
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
            Ориентиры по стоимости
          </h2>
          <p className="mt-4 max-w-2xl text-zinc-400">
            Цены «от» — стартовая вилка после короткого брифа. Фиксируем смету
            до старта работ, без скрытых доплат за «сюрпризы».
          </p>
        </Reveal>

        <div className="mt-12 md:mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PACKAGES.map((pkg, i) => {
            const botHref =
              pkg.id === "support"
                ? telegramBotStartLink("support")
                : telegramBotStartLink(`pkg_${pkg.id}`);
            const isRetainer = pkg.id === "support";
            return (
              <Reveal key={pkg.id} delay={i * 0.06}>
                <article
                  className={`glass group relative flex h-full flex-col rounded-2xl p-6 transition duration-300 hover:-translate-y-1 ${
                    pkg.highlight
                      ? "border-cyan-neon/30 shadow-[0_0_0_1px_rgba(0,240,255,0.12)] hover:shadow-[0_0_32px_rgba(0,240,255,0.18)]"
                      : isRetainer
                        ? "border-purple-neon/25 hover:border-purple-neon/40"
                        : "hover:border-cyan-neon/25 hover:shadow-[0_0_28px_rgba(0,240,255,0.1)]"
                  }`}
                >
                  {(pkg.highlight || isRetainer) && (
                    <span
                      className={`absolute -top-3 left-6 rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        isRetainer
                          ? "bg-purple-neon/90 text-void"
                          : "bg-neon-gradient text-void"
                      }`}
                    >
                      {isRetainer ? "Retainer" : "Хит"}
                    </span>
                  )}
                  <p className="text-[11px] uppercase tracking-wider text-zinc-500">
                    {pkg.badge}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-semibold text-white">
                    {pkg.name}
                  </h3>
                  <p className="mt-3 font-display text-2xl font-bold text-neon">
                    от {pkg.priceFrom}
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">
                    {pkg.description}
                  </p>
                  <ul className="mt-5 space-y-2 border-t border-white/5 pt-5">
                    {pkg.includes.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-xs text-zinc-400"
                      >
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-neon" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <NeonButton
                    href={botHref}
                    variant={pkg.highlight ? "primary" : "ghost"}
                    className="mt-6 w-full text-center"
                    onClick={() =>
                      reachGoal("click_package", { package: pkg.id })
                    }
                  >
                    Открыть в боте
                  </NeonButton>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default memo(Packages);
