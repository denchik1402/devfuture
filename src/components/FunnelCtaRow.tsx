"use client";

import NeonButton from "@/components/NeonButton";
import { reachGoal } from "@/lib/analytics";
import { siteConfig } from "@/lib/site";

type Props = {
  slug: string;
  kind: "resheniya" | "keysy" | "blog";
  quizHref?: string;
};

/** Primary CTAs that also fire funnel_cta for Metrika chain analysis. */
export default function FunnelCtaRow({
  slug,
  kind,
  quizHref = "/#quiz",
}: Props) {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <NeonButton
        href={siteConfig.telegramUrl}
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
        onClick={() => reachGoal("funnel_cta", { kind, slug, cta: "brief" })}
      >
        Собрать бриф за 30 сек
      </NeonButton>
    </div>
  );
}
