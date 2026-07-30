"use client";

import { memo, useMemo, useState } from "react";
import Reveal from "./Reveal";
import NeonButton from "./NeonButton";
import { PACKAGES } from "@/lib/content";
import { telegramBotStartLink } from "@/lib/site";
import { reachGoal } from "@/lib/analytics";

const TYPES = [
  { id: "bot", label: "Telegram-бот" },
  { id: "landing", label: "Лендинг / сайт" },
  { id: "web", label: "Кабинет / веб" },
  { id: "desktop", label: "Десктоп" },
] as const;

const YES_NO = [
  { id: "no", label: "Нет" },
  { id: "yes", label: "Да" },
] as const;

const TIMELINES = [
  { id: "asap", label: "Как можно скорее" },
  { id: "week", label: "За 1–2 недели" },
  { id: "month", label: "В горизонте месяца" },
] as const;

type PackageId = "bot" | "landing" | "web";

function recommendPackage(
  type: (typeof TYPES)[number]["id"],
  roles: "no" | "yes",
  integrations: "no" | "yes"
): { id: PackageId; reason: string } {
  let id: PackageId =
    type === "bot" ? "bot" : type === "landing" ? "landing" : "web";

  const bump = roles === "yes" || integrations === "yes";
  if (bump) {
    if (id === "bot") id = roles === "yes" && integrations === "yes" ? "web" : "landing";
    else id = "web";
  }

  const reasons: string[] = [];
  if (type === "bot" && id === "bot") {
    reasons.push("Простой сценарий в Telegram без ролей и сложных связок");
  } else if (type === "landing" && id === "landing") {
    reasons.push("Продающая страница или небольшой сайт услуг");
  } else if (type === "desktop" || type === "web") {
    reasons.push(
      type === "desktop"
        ? "Десктоп ближе к кабинету/сервису по объёму работ"
        : "Веб-кабинет или внутренний сервис"
    );
  }
  if (roles === "yes") reasons.push("нужны роли и доступы");
  if (integrations === "yes") reasons.push("нужны интеграции");
  if (bump && id === "web" && type === "bot") {
    reasons.push("роли и интеграции тянут к веб-пакету");
  } else if (bump && id === "landing" && type === "bot") {
    reasons.push("чуть сложнее чистого бота-MVP");
  }

  return {
    id,
    reason: reasons.length
      ? reasons.join(" · ")
      : "Под ваш тип задачи из ориентиров по пакетам",
  };
}

function BudgetEstimator() {
  const [type, setType] = useState<(typeof TYPES)[number]["id"]>("bot");
  const [roles, setRoles] = useState<"no" | "yes">("no");
  const [integrations, setIntegrations] = useState<"no" | "yes">("no");
  const [timeline, setTimeline] =
    useState<(typeof TIMELINES)[number]["id"]>("asap");

  const recommendation = useMemo(
    () => recommendPackage(type, roles, integrations),
    [type, roles, integrations]
  );

  const pkg = PACKAGES.find((p) => p.id === recommendation.id)!;
  const support = PACKAGES.find((p) => p.id === "support");
  const estimatePayload = [
    "estimate",
    pkg.id,
    type,
    roles,
    integrations,
    timeline,
  ].join("_");
  const botHref = telegramBotStartLink(estimatePayload);

  const timelineNote =
    timeline === "asap"
      ? "Срочность учтём в брифе — стартуем с MVP."
      : timeline === "week"
        ? "Горизонт 1–2 недель хорошо ложится на пакет выше."
        : "Месяц даёт запас на итерации и поддержку.";

  return (
    <section id="estimator" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.04),transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
            Ориентир
          </p>
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
            Подберите пакет за минуту
          </h2>
          <p className="mt-4 max-w-2xl text-zinc-400">
            Четыре ответа — рекомендация из пакетов DevFuture. Точная смета
            после короткого брифа.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mt-12 md:mt-14">
          <div className="glass rounded-2xl p-6 md:p-8">
            <Step
              title="1. Что делаем?"
              options={TYPES.map((t) => ({ id: t.id, label: t.label }))}
              value={type}
              onChange={(v) => setType(v as typeof type)}
            />
            <Step
              className="mt-8"
              title="2. Нужны роли / доступы?"
              options={YES_NO.map((o) => ({ id: o.id, label: o.label }))}
              value={roles}
              onChange={(v) => setRoles(v as typeof roles)}
            />
            <Step
              className="mt-8"
              title="3. Нужны интеграции (CRM, API, оплаты)?"
              options={YES_NO.map((o) => ({ id: o.id, label: o.label }))}
              value={integrations}
              onChange={(v) => setIntegrations(v as typeof integrations)}
            />
            <Step
              className="mt-8"
              title="4. Когда нужен результат?"
              options={TIMELINES.map((t) => ({ id: t.id, label: t.label }))}
              value={timeline}
              onChange={(v) => setTimeline(v as typeof timeline)}
            />

            <div className="mt-10 rounded-2xl border border-cyan-neon/20 bg-cyan-neon/5 p-5 md:p-6">
              <p className="font-display text-xs uppercase tracking-[0.25em] text-cyan-neon/70">
                Рекомендуем
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold text-white">
                {pkg.name}
              </h3>
              <p className="mt-2 font-display text-xl font-semibold text-neon">
                от {pkg.priceFrom}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {recommendation.reason}. {timelineNote}
              </p>
              {support && (
                <p className="mt-3 text-xs text-zinc-500">
                  Upsell: пакет «{support.name}» — от {support.priceFrom} после
                  релиза.
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <NeonButton
                  href={botHref}
                  pulse
                  onClick={() => {
                    reachGoal("open_estimator", {
                      package: pkg.id,
                      estimate: "1",
                    });
                    reachGoal("click_package", { package: pkg.id });
                  }}
                >
                  Открыть в боте с этой оценкой
                </NeonButton>
                <NeonButton
                  href="#contact"
                  variant="ghost"
                  onClick={() =>
                    reachGoal("open_packages", { package: pkg.id })
                  }
                >
                  Обсудить в форме
                </NeonButton>
                <NeonButton href="/brief" variant="ghost">
                  Полный бриф
                </NeonButton>
              </div>
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

export default memo(BudgetEstimator);
