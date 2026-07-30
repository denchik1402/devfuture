"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import NeonButton from "@/components/NeonButton";
import { telegramBotStartLink } from "@/lib/site";

const BOT_TYPES = [
  { id: "booking", label: "запись" },
  { id: "leads", label: "заявки" },
  { id: "shop", label: "магазин/доставка" },
  { id: "school", label: "школа" },
  { id: "other", label: "другое" },
] as const;

const MENU_ITEMS = [
  { id: "services", label: "услуги" },
  { id: "slots", label: "слоты" },
  { id: "catalog", label: "каталог" },
  { id: "statuses", label: "статусы" },
  { id: "faq", label: "FAQ" },
  { id: "reminders", label: "напоминания" },
  { id: "roles", label: "роли" },
] as const;

const ROLE_OPTIONS = [
  { id: "none", label: "нет" },
  { id: "admin_client", label: "админ+клиент" },
  { id: "plus_staff", label: "+курьер/сотрудник" },
] as const;

const REMINDER_OPTIONS = [
  { id: "yes", label: "да" },
  { id: "no", label: "нет" },
] as const;

type BotTypeId = (typeof BOT_TYPES)[number]["id"];
type MenuId = (typeof MENU_ITEMS)[number]["id"];
type RoleId = (typeof ROLE_OPTIONS)[number]["id"];
type ReminderId = (typeof REMINDER_OPTIONS)[number]["id"];

const STEPS = [
  "Тип бота",
  "Пункты меню",
  "Роли",
  "Напоминания",
  "Итог",
] as const;

function chipClass(active: boolean) {
  return `rounded-full border px-3.5 py-2 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon ${
    active
      ? "border-cyan-neon/50 bg-cyan-neon/15 text-cyan-neon"
      : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
  }`;
}

export default function ScenarioWizard() {
  const [step, setStep] = useState(0);
  const [botType, setBotType] = useState<BotTypeId>("booking");
  const [menu, setMenu] = useState<MenuId[]>(["services", "slots", "reminders"]);
  const [roles, setRoles] = useState<RoleId>("admin_client");
  const [reminders, setReminders] = useState<ReminderId>("yes");

  const toggleMenu = (id: MenuId) => {
    setMenu((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const summary = useMemo(() => {
    const botLabel =
      BOT_TYPES.find((t) => t.id === botType)?.label ?? botType;
    const roleLabel =
      ROLE_OPTIONS.find((r) => r.id === roles)?.label ?? roles;
    const reminderLabel =
      REMINDER_OPTIONS.find((r) => r.id === reminders)?.label ?? reminders;
    const menuLabels = MENU_ITEMS.filter((m) => menu.includes(m.id)).map(
      (m) => m.label
    );
    return [
      "Сценарий Telegram-бота (DevFuture)",
      `Дата: ${new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })} (МСК)`,
      "",
      `Тип бота: ${botLabel}`,
      `Пункты меню: ${menuLabels.length ? menuLabels.join(", ") : "—"}`,
      `Роли: ${roleLabel}`,
      `Напоминания: ${reminderLabel}`,
      "",
      "Хочу обсудить похожий сценарий.",
    ].join("\n");
  }, [botType, menu, roles, reminders]);

  const briefHref = useMemo(() => {
    const params = new URLSearchParams({
      type: "bot",
      message: summary,
    });
    return `/brief?${params.toString()}`;
  }, [summary]);

  const download = () => {
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devfuture-scenario-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const canNext =
    step === 1 ? menu.length > 0 : step < STEPS.length - 1;

  return (
    <div className="glass rounded-2xl p-6 md:p-8">
      <div className="flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={`rounded-full px-3 py-1 font-display text-xs tracking-wide ${
              i === step
                ? "bg-cyan-neon/15 text-cyan-neon"
                : i < step
                  ? "text-zinc-300"
                  : "text-zinc-600"
            }`}
          >
            {i + 1}. {label}
          </span>
        ))}
      </div>

      {step === 0 && (
        <div className="mt-8">
          <p className="font-display text-sm font-semibold text-white">
            Какой тип бота?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {BOT_TYPES.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setBotType(opt.id)}
                className={chipClass(botType === opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="mt-8">
          <p className="font-display text-sm font-semibold text-white">
            Что в меню? (можно несколько)
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {MENU_ITEMS.map((opt) => {
              const active = menu.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleMenu(opt.id)}
                  className={chipClass(active)}
                  aria-pressed={active}
                >
                  {active ? "✓ " : ""}
                  {opt.label}
                </button>
              );
            })}
          </div>
          {menu.length === 0 && (
            <p className="mt-3 text-xs text-zinc-500">
              Выберите хотя бы один пункт.
            </p>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="mt-8">
          <p className="font-display text-sm font-semibold text-white">
            Нужны роли?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRoles(opt.id)}
                className={chipClass(roles === opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-8">
          <p className="font-display text-sm font-semibold text-white">
            Нужны напоминания?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {REMINDER_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setReminders(opt.id)}
                className={chipClass(reminders === opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="mt-8">
          <p className="font-display text-sm font-semibold text-white">
            Сводка сценария
          </p>
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/[0.03] p-5 font-sans text-sm leading-relaxed text-zinc-200">
            {summary}
          </pre>
          <div className="mt-6 flex flex-wrap gap-3">
            <NeonButton href={telegramBotStartLink("order")} pulse>
              Открыть в боте
            </NeonButton>
            <NeonButton href={briefHref} variant="ghost">
              Открыть бриф
            </NeonButton>
            <button
              type="button"
              onClick={download}
              className="glass rounded-full px-7 py-3.5 font-display text-sm font-semibold text-zinc-100"
            >
              Скачать .txt
            </button>
          </div>
          <p className="mt-4 text-sm text-zinc-500">
            Или{" "}
            <Link href={briefHref} className="text-cyan-neon hover:underline">
              /brief?message=…&amp;type=bot
            </Link>
          </p>
        </div>
      )}

      {step < 4 && (
        <div className="mt-10 flex flex-wrap gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="glass rounded-full px-7 py-3.5 font-display text-sm font-semibold text-zinc-100"
            >
              Назад
            </button>
          )}
          <button
            type="button"
            disabled={!canNext}
            onClick={() => setStep((s) => Math.min(s + 1, 4))}
            className="rounded-full bg-neon-gradient px-7 py-3.5 font-display text-sm font-semibold text-void disabled:cursor-not-allowed disabled:opacity-40"
          >
            Далее
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setStep(0)}
            className="text-sm text-zinc-500 hover:text-cyan-neon"
          >
            ← Собрать заново
          </button>
        </div>
      )}
    </div>
  );
}
