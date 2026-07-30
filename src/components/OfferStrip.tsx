"use client";

import { memo } from "react";
import { Zap } from "lucide-react";
import NeonButton from "./NeonButton";
import { telegramBotStartLink } from "@/lib/site";
import { reachGoal } from "@/lib/analytics";

function OfferStrip() {
  return (
    <section
      id="offer"
      aria-label="Быстрый старт"
      className="relative border-y border-white/5 bg-void bg-gradient-to-r from-cyan-neon/10 via-transparent to-purple-neon/10"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3 sm:items-center">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-neon/30 bg-cyan-neon/10 text-cyan-neon sm:mt-0">
            <Zap className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div>
            <p className="font-display text-sm font-semibold text-white sm:text-base">
              Напишите задачу — ответим и предложим формат работ
            </p>
            <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
              Telegram или короткая форма на сайте. Оценка срока без длинной
              переписки.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-wrap gap-3 sm:w-auto">
          <NeonButton
            href={telegramBotStartLink("order")}
            pulse
            className="w-full sm:w-auto"
            onClick={() =>
              reachGoal("click_telegram", { place: "offer_primary" })
            }
          >
            Написать в Telegram
          </NeonButton>
          <NeonButton
            href="#quiz"
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={() => reachGoal("open_contact", { place: "offer_quiz" })}
          >
            Описать задачу
          </NeonButton>
        </div>
      </div>
    </section>
  );
}

export default memo(OfferStrip);
