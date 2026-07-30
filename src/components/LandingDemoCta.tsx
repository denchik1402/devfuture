"use client";

import { memo } from "react";
import { Bot } from "lucide-react";
import NeonButton from "./NeonButton";
import { telegramBotStartLink } from "@/lib/site";
import { reachGoal } from "@/lib/analytics";

type Props = {
  slug?: string;
  relatedCases?: string[];
};

function demoPayloadFor(slug?: string, relatedCases?: string[]): string {
  const s = slug || "";
  const cases = relatedCases || [];
  if (
    s.includes("klinik") ||
    s.includes("salon") ||
    s.includes("zapisi") ||
    cases.some((c) => c.includes("booking") || c.includes("salon"))
  ) {
    return "demo_booking";
  }
  if (
    s.includes("dostav") ||
    s.includes("magazin") ||
    cases.some((c) => c.includes("delivery") || c.includes("shop"))
  ) {
    return "demo_shop";
  }
  if (s.includes("b2b") || s.includes("online-shkol") || s.includes("shkoly")) {
    return "demo_qualify";
  }
  return "demo_booking";
}

function LandingDemoCta({ slug, relatedCases }: Props) {
  const primary = demoPayloadFor(slug, relatedCases);
  const primaryLabel =
    primary === "demo_shop"
      ? "Демо магазина / доставки"
      : primary === "demo_qualify"
        ? "Демо квалификации"
        : "Демо записи";

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
              Живой сценарий под эту нишу — без заявки. Потом можно заказать
              похожий бот.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <NeonButton
            href={telegramBotStartLink(primary)}
            pulse
            className="!px-5 !py-2.5 text-xs sm:text-sm"
            onClick={() =>
              reachGoal("open_demo", {
                place: "landing_demo",
                demo: primary,
                slug: slug || "",
              })
            }
          >
            {primaryLabel}
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
