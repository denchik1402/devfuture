"use client";

import { memo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import Reveal from "./Reveal";
import { FAQ_ITEMS } from "@/lib/content";

function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-20" />

      <div className="relative mx-auto max-w-3xl px-6">
        <Reveal>
          <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
            FAQ
          </p>
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
            Частые вопросы
          </h2>
        </Reveal>

        <div className="mt-12 space-y-3">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={i * 0.05}>
                <div className="glass overflow-hidden rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-button-${i}`}
                  >
                    <span className="font-display text-sm font-medium text-white sm:text-base">
                      {item.q}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-cyan-neon"
                      aria-hidden
                    >
                      <Plus className="h-4 w-4" />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-panel-${i}`}
                        role="region"
                        aria-labelledby={`faq-button-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <p className="border-t border-white/5 px-6 pb-5 pt-3 text-sm leading-relaxed text-zinc-400">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default memo(Faq);
