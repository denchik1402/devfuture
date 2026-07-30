"use client";

import { memo, useMemo, useState } from "react";
import Reveal from "./Reveal";
import NeonButton from "./NeonButton";
import { BRIEF_TYPES } from "@/lib/content";
import { telegramBriefLink } from "@/lib/site";
import { formatSourceTag, loadAttribution } from "@/lib/attribution";
import { reachGoal } from "@/lib/analytics";

const TIMELINES = [
  { id: "asap", label: "Как можно скорее" },
  { id: "week", label: "В течение 1–2 недель" },
  { id: "month", label: "В горизонте месяца" },
] as const;

const BUDGETS = [
  { id: "15-40", label: "15–40 тыс. ₽" },
  { id: "40-100", label: "40–100 тыс. ₽" },
  { id: "100+", label: "от 100 тыс. ₽" },
] as const;

function BriefQuiz() {
  const [type, setType] = useState<(typeof BRIEF_TYPES)[number]["value"]>(
    BRIEF_TYPES[0].value
  );
  const [timeline, setTimeline] =
    useState<(typeof TIMELINES)[number]["id"]>("asap");
  const [budget, setBudget] = useState<(typeof BUDGETS)[number]["id"]>("15-40");

  const typeLabel =
    BRIEF_TYPES.find((t) => t.value === type)?.label ?? type;
  const timeLabel =
    TIMELINES.find((t) => t.id === timeline)?.label ?? timeline;
  const budgetLabel =
    BUDGETS.find((b) => b.id === budget)?.label ?? budget;

  const briefText = useMemo(() => {
    return [
      "Бриф за 30 секунд (с сайта DevFuture)",
      `Тип: ${typeLabel}`,
      `Срок: ${timeLabel}`,
      `Бюджет: ${budgetLabel}`,
      "",
      "Задача:",
    ].join("\n");
  }, [typeLabel, timeLabel, budgetLabel]);

  const telegramHref = useMemo(
    () => telegramBriefLink(briefText),
    [briefText]
  );

  const messagePrefill = useMemo(
    () =>
      [`Срок: ${timeLabel}`, `Бюджет: ${budgetLabel}`, "", "Задача:"].join(
        "\n"
      ),
    [timeLabel, budgetLabel]
  );

  const briefPdfHref = useMemo(() => {
    const params = new URLSearchParams({
      type,
      timeline,
      budget,
      message: messagePrefill,
    });
    return `/brief?${params.toString()}`;
  }, [type, timeline, budget, messagePrefill]);

  const persistAndSticky = (channel: string) => {
    const payload = {
      type,
      timeline,
      budget,
      message: messagePrefill,
      source: formatSourceTag("homepage_quiz", loadAttribution()),
    };
    try {
      sessionStorage.setItem("df_quiz_prefill", JSON.stringify(payload));
    } catch {
      // ignore
    }
    window.dispatchEvent(
      new CustomEvent("df:quiz-sticky", {
        detail: {
          type,
          timeline,
          budget,
          message: messagePrefill,
        },
      })
    );
    reachGoal("quiz_complete", { type, timeline, budget, channel });
  };

  const goToForm = () => {
    persistAndSticky("form");
    const el = document.getElementById("contact");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.dispatchEvent(new Event("df:quiz-prefill"));
    }
  };

  return (
    <section id="quiz" className="relative py-24 md:py-32">
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
            Быстрый бриф
          </p>
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
            Соберите задачу за 30 секунд
          </h2>
          <p className="mt-4 max-w-2xl text-zinc-400">
            Три выбора — префилл формы на сайте или готовое сообщение в
            Telegram.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mt-12 md:mt-14">
          <div className="glass rounded-2xl p-6 md:p-8">
            <Step
              title="1. Что нужно?"
              options={BRIEF_TYPES.map((t) => ({
                id: t.value,
                label: t.label,
              }))}
              value={type}
              onChange={(v) => setType(v as typeof type)}
            />
            <Step
              className="mt-8"
              title="2. Когда нужен результат?"
              options={TIMELINES.map((t) => ({ id: t.id, label: t.label }))}
              value={timeline}
              onChange={(v) => setTimeline(v as typeof timeline)}
            />
            <Step
              className="mt-8"
              title="3. Ориентир по бюджету?"
              options={BUDGETS.map((b) => ({ id: b.id, label: b.label }))}
              value={budget}
              onChange={(v) => setBudget(v as typeof budget)}
            />

            <div className="mt-10 flex flex-wrap gap-3">
              <NeonButton href="#contact" pulse onClick={goToForm}>
                Продолжить в форме
              </NeonButton>
              <NeonButton
                href={telegramHref}
                variant="ghost"
                onClick={() => persistAndSticky("telegram")}
              >
                Открыть в Telegram
              </NeonButton>
              <NeonButton
                href={briefPdfHref}
                variant="ghost"
                onClick={() => persistAndSticky("brief")}
              >
                Скачать бриф (PDF)
              </NeonButton>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Step({
  title,
  options,
  value,
  onChange,
  className = "",
}: {
  title: string;
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="font-display text-sm font-semibold text-white">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt.id === value;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`rounded-full border px-3.5 py-2 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon ${
                active
                  ? "border-cyan-neon/50 bg-cyan-neon/15 text-cyan-neon"
                  : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(BriefQuiz);
