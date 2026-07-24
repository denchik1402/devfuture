"use client";

import { memo } from "react";
import { Quote } from "lucide-react";
import Reveal from "./Reveal";
import { TESTIMONIALS } from "@/lib/content";

function Testimonials() {
  return (
    <section id="reviews" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(176,38,255,0.06),transparent_50%)]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
            Отзывы
          </p>
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
            Как с нами работают
          </h2>
          <p className="mt-4 max-w-2xl text-zinc-400">
            Короткие отзывы без «логотипов Fortune 500» — про сроки, связь и
            результат.
          </p>
        </Reveal>

        <div className="mt-12 md:mt-14 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((item, i) => (
            <Reveal key={item.name} delay={i * 0.08}>
              <blockquote className="glass flex h-full flex-col rounded-2xl p-6">
                <Quote className="h-5 w-5 text-cyan-neon/60" strokeWidth={1.5} />
                <p className="mt-4 flex-1 text-sm leading-relaxed text-zinc-300">
                  «{item.quote}»
                </p>
                <footer className="mt-6 border-t border-white/5 pt-4">
                  <cite className="not-italic font-display text-sm font-semibold text-white">
                    {item.name}
                  </cite>
                  <p className="mt-1 text-xs text-zinc-500">{item.role}</p>
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(Testimonials);
