"use client";

import { memo } from "react";
import NeonButton from "@/components/NeonButton";
import { reachGoal } from "@/lib/analytics";
import { telegramBotStartLink } from "@/lib/site";

type Props = {
  slug: string;
  kind: "resheniya" | "keysy" | "blog";
  quizHref?: string;
  /** Optional bot start payload (e.g. demo_booking) */
  botStart?: string;
};

/** Primary Telegram + secondary «описать задачу» — единый словарь CTA. */
export default function FunnelCtaRow({
  slug,
  kind,
  quizHref = "/#quiz",
  botStart = "order",
}: Props) {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <NeonButton
        href={telegramBotStartLink(botStart)}
        pulse
        onClick={() =>
          reachGoal("funnel_cta", { kind, slug, cta: "telegram" })
        }
      >
        Написать в Telegram
      </NeonButton>
      <NeonButton
        href={quizHref}
        variant="ghost"
        onClick={() => reachGoal("funnel_cta", { kind, slug, cta: "task" })}
      >
        Описать задачу
      </NeonButton>
    </div>
  );
}
