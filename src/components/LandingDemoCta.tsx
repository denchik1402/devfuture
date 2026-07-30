"use client";

import { memo } from "react";
import { Bot } from "lucide-react";
import NeonButton from "./NeonButton";
import { telegramBotStartLink } from "@/lib/site";
import { reachGoal } from "@/lib/analytics";

function LandingDemoCta() {
  return (
    <div className="glass mt-10 rounded-2xl p-6 md:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-neon/15 text-cyan-neon">
            <Bot className="h-5 w-5" strokeWidth={1.5} />
          </span>
          <div>
            <p className="font-display text-sm font-semibold text-white">
              Попробуйте демо в Telegram
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Живой сценарий записи или каталог демо-ботов — без заявки.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <NeonButton
            href={telegramBotStartLink("demo_booking")}
            pulse
            className="!px-5 !py-2.5 text-xs sm:text-sm"
            onClick={() =>
              reachGoal("open_demo", { place: "landing_demo_booking" })
            }
          >
            Демо записи
          </NeonButton>
          <NeonButton
            href={telegramBotStartLink("demos")}
            variant="ghost"
            className="!px-5 !py-2.5 text-xs sm:text-sm"
            onClick={() =>
              reachGoal("open_demo", { place: "landing_demos" })
            }
          >
            Все демо
          </NeonButton>
        </div>
      </div>
    </div>
  );
}

export default memo(LandingDemoCta);
