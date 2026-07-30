"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FAQ_ITEMS, PACKAGES } from "@/lib/content";
import { SERVICE_PAGES } from "@/lib/services";
import { formatSourceTag, loadAttribution } from "@/lib/attribution";
import type { BotLead, LeadStatus } from "@/lib/bot-leads";
import { useTelegramWebApp } from "./useTelegramWebApp";

type Tab = "home" | "offer" | "demo" | "faq" | "lead" | "admin";

const BASE_TABS: { id: Tab; label: string }[] = [
  { id: "home", label: "Главная" },
  { id: "offer", label: "Пакеты" },
  { id: "demo", label: "Демо" },
  { id: "faq", label: "FAQ" },
  { id: "lead", label: "Заявка" },
];

const STATUS_PILLS: { id: LeadStatus; label: string }[] = [
  { id: "new", label: "new" },
  { id: "progress", label: "progress" },
  { id: "wait", label: "wait" },
  { id: "done", label: "done" },
];

type LeadStats = {
  total: number;
  today: number;
  new: number;
  progress: number;
  wait: number;
  done: number;
};

const DEMO_CARDS = [
  {
    id: "booking",
    title: "Запись",
    hint: "Бот записи на услуги",
    steps: ["Выберите услугу", "Выберите время", "Подтвердите запись"],
    ctaMessage:
      "Нужен бот записи: услуги, слоты, подтверждение и напоминания.",
  },
  {
    id: "shop",
    title: "Магазин",
    hint: "Каталог и заказ в Telegram",
    steps: ["Откройте каталог", "Добавьте в корзину", "Оформите заказ"],
    ctaMessage:
      "Нужен магазин в Telegram: каталог, корзина и оформление заказа.",
  },
  {
    id: "lead",
    title: "Заявка",
    hint: "Сбор лидов и квалификация",
    steps: ["Короткий вопрос", "Контакт", "Заявка у менеджера"],
    ctaMessage:
      "Нужен бот заявок: квалификация лида и передача менеджеру.",
  },
] as const;

function statusPillClass(status: LeadStatus, active: boolean) {
  if (!active) return "border-white/10 text-zinc-500";
  switch (status) {
    case "new":
      return "border-cyan-neon/40 bg-cyan-neon/15 text-cyan-neon";
    case "progress":
      return "border-amber-400/40 bg-amber-400/15 text-amber-300";
    case "wait":
      return "border-violet-400/40 bg-violet-400/15 text-violet-300";
    case "done":
      return "border-emerald-400/40 bg-emerald-400/15 text-emerald-300";
  }
}

export default function TgMiniApp() {
  const { webApp, user, initData } = useTelegramWebApp();
  const [tab, setTab] = useState<Tab>("home");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [type, setType] = useState<string>(PACKAGES[0]?.name || "Бот-MVP");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [demoStep, setDemoStep] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle"
  );
  const [error, setError] = useState("");
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [leads, setLeads] = useState<BotLead[]>([]);
  const [leadStatsView, setLeadStatsView] = useState<LeadStats | null>(null);
  const [crmLoading, setCrmLoading] = useState(false);
  const [crmBusyId, setCrmBusyId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const tabs = useMemo(() => {
    if (!isAdminUser) return BASE_TABS;
    return [...BASE_TABS, { id: "admin" as const, label: "CRM" }];
  }, [isAdminUser]);

  const loadCrm = useCallback(async () => {
    if (!initData) return false;
    setCrmLoading(true);
    try {
      const res = await fetch("/api/admin/leads?limit=20", {
        headers: { "x-telegram-init-data": initData },
      });
      if (!res.ok) {
        setIsAdminUser(false);
        return false;
      }
      const data = (await res.json()) as {
        leads?: BotLead[];
        stats?: LeadStats;
      };
      setIsAdminUser(true);
      setLeads(Array.isArray(data.leads) ? data.leads : []);
      setLeadStatsView(data.stats ?? null);
      return true;
    } catch {
      setIsAdminUser(false);
      return false;
    } finally {
      setCrmLoading(false);
    }
  }, [initData]);

  useEffect(() => {
    if (!initData) return;
    void loadCrm();
  }, [initData, loadCrm]);

  useEffect(() => {
    if (!isAdminUser && tab === "admin") setTab("home");
  }, [isAdminUser, tab]);

  useEffect(() => {
    if (!user) return;
    if (!name && user.first_name) {
      setName([user.first_name, user.last_name].filter(Boolean).join(" "));
    }
    if (!contact && user.username) {
      setContact(`@${user.username}`);
    }
  }, [user, name, contact]);

  const typeOptions = useMemo(
    () => [
      ...PACKAGES.map((p) => p.name),
      ...SERVICE_PAGES.map((s) => s.shortName),
      "Другое",
    ],
    []
  );

  const go = (next: Tab) => {
    setTab(next);
    webApp?.HapticFeedback?.impactOccurred("light");
    if (next === "admin" && isAdminUser) void loadCrm();
  };

  async function patchLead(
    id: string,
    patch: {
      status?: LeadStatus;
      note?: string;
      tag?: string;
      assigneeSelf?: boolean;
    }
  ) {
    if (!initData) return;
    setCrmBusyId(id);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-telegram-init-data": initData,
        },
        body: JSON.stringify({ id, ...patch }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        lead?: BotLead;
        error?: string;
      };
      if (!res.ok || !data.lead) return;
      setLeads((prev) =>
        prev.map((l) => (l.id === data.lead!.id ? data.lead! : l))
      );
      webApp?.HapticFeedback?.impactOccurred("light");
      if (patch.status || patch.assigneeSelf) void loadCrm();
    } finally {
      setCrmBusyId(null);
    }
  }

  const openLeadFromDemo = (demoMessage: string) => {
    setMessage(demoMessage);
    setType("Бот-MVP");
    go("lead");
  };

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setStatus("error");
      setError("Нужно согласие на обработку данных");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          contact,
          type,
          message,
          source: formatSourceTag("telegram_mini_app", loadAttribution()),
          company: "",
          consent: true,
          initData,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(data.error || "Не удалось отправить. Попробуйте ещё раз.");
        return;
      }
      setStatus("ok");
      setMessage("");
      setConsent(false);
      webApp?.HapticFeedback?.impactOccurred("medium");
    } catch {
      setStatus("error");
      setError("Сеть недоступна. Проверьте соединение.");
    }
  }

  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-lg flex-col bg-void text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,240,255,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-40" />

      <header className="relative z-10 flex items-center justify-between px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div>
          <p className="font-display text-[11px] uppercase tracking-[0.28em] text-cyan-neon/70">
            Mini App
          </p>
          <h1 className="font-display text-xl font-bold text-white">
            Dev<span className="text-neon">Future</span>
          </h1>
        </div>
        {webApp ? (
          <button
            type="button"
            onClick={() => webApp.close()}
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-400"
          >
            Закрыть
          </button>
        ) : null}
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto px-5 pb-28">
        {tab === "home" && (
          <section className="space-y-5">
            <div className="glass rounded-2xl p-5">
              <p className="font-display text-2xl font-semibold leading-tight text-white">
                Сайты, боты и автоматизация{" "}
                <span className="text-neon">под ключ</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Простой бот / MVP часто показываем в день обращения. Оставьте
                заявку или выберите пакет.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => go("lead")}
                  className="rounded-full bg-neon-gradient px-5 py-2.5 font-display text-sm font-semibold text-void"
                >
                  Оставить заявку
                </button>
                <button
                  type="button"
                  onClick={() => go("offer")}
                  className="glass rounded-full px-5 py-2.5 text-sm text-zinc-200"
                >
                  Пакеты и услуги
                </button>
                <button
                  type="button"
                  onClick={() => go("demo")}
                  className="glass rounded-full px-5 py-2.5 text-sm text-zinc-200"
                >
                  Смотреть демо
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {PACKAGES.slice(0, 2).map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => {
                    setType(pkg.name);
                    go("lead");
                  }}
                  className="glass rounded-2xl p-4 text-left"
                >
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                    {pkg.badge}
                  </p>
                  <p className="mt-1 font-display text-sm font-semibold text-white">
                    {pkg.name}
                  </p>
                  <p className="mt-2 text-sm text-cyan-neon">
                    от {pkg.priceFrom}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        {tab === "offer" && (
          <section className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-white">
              Пакеты
            </h2>
            {PACKAGES.map((pkg) => (
              <article key={pkg.id} className="glass rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-base font-semibold text-white">
                      {pkg.name}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">{pkg.badge}</p>
                  </div>
                  <p className="shrink-0 font-display text-sm text-cyan-neon">
                    от {pkg.priceFrom}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {pkg.description}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setType(pkg.name);
                    go("lead");
                  }}
                  className="mt-4 w-full rounded-full border border-cyan-neon/30 py-2 text-sm text-cyan-neon"
                >
                  Заявка на пакет
                </button>
              </article>
            ))}

            <h2 className="pt-2 font-display text-lg font-semibold text-white">
              Услуги
            </h2>
            {SERVICE_PAGES.map((s) => (
              <article key={s.slug} className="glass rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-display text-base font-semibold text-white">
                    {s.shortName}
                  </p>
                  <p className="shrink-0 text-sm text-cyan-neon">
                    от {s.priceFrom}
                  </p>
                </div>
                <p className="mt-2 text-sm text-zinc-400">{s.description}</p>
                <button
                  type="button"
                  onClick={() => {
                    setType(s.shortName);
                    go("lead");
                  }}
                  className="mt-4 w-full rounded-full border border-white/10 py-2 text-sm text-zinc-200"
                >
                  Заявка по услуге
                </button>
              </article>
            ))}
          </section>
        )}

        {tab === "demo" && (
          <section className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-white">
              Демо сценарии
            </h2>
            <p className="text-sm text-zinc-500">
              Нажмите шаги — так выглядит мини-флоу бота. В конце можно сразу
              оставить заявку.
            </p>
            {DEMO_CARDS.map((card) => {
              const step = demoStep[card.id] ?? 0;
              const done = step >= card.steps.length;
              return (
                <article key={card.id} className="glass rounded-2xl p-4">
                  <p className="font-display text-base font-semibold text-white">
                    {card.title}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">{card.hint}</p>
                  <ol className="mt-4 space-y-2">
                    {card.steps.map((label, i) => {
                      const active = i === step;
                      const completed = i < step;
                      return (
                        <li key={label}>
                          <button
                            type="button"
                            onClick={() => {
                              setDemoStep((prev) => ({
                                ...prev,
                                [card.id]: i,
                              }));
                              webApp?.HapticFeedback?.impactOccurred("light");
                            }}
                            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                              active
                                ? "border-cyan-neon/40 bg-cyan-neon/10 text-cyan-neon"
                                : completed
                                  ? "border-white/10 text-zinc-300"
                                  : "border-white/5 text-zinc-500"
                            }`}
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-[11px]">
                              {completed ? "✓" : i + 1}
                            </span>
                            {label}
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {!done ? (
                      <button
                        type="button"
                        onClick={() => {
                          setDemoStep((prev) => ({
                            ...prev,
                            [card.id]: Math.min(
                              (prev[card.id] ?? 0) + 1,
                              card.steps.length
                            ),
                          }));
                          webApp?.HapticFeedback?.impactOccurred("light");
                        }}
                        className="rounded-full bg-neon-gradient px-4 py-2 text-sm font-semibold text-void"
                      >
                        Дальше
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openLeadFromDemo(card.ctaMessage)}
                        className="rounded-full bg-neon-gradient px-4 py-2 text-sm font-semibold text-void"
                      >
                        Хочу такой бот
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setDemoStep((prev) => ({ ...prev, [card.id]: 0 }))
                      }
                      className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-400"
                    >
                      Сбросить
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {tab === "faq" && (
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-white">
              FAQ
            </h2>
            {FAQ_ITEMS.map((item, i) => {
              const open = openFaq === i;
              return (
                <div key={item.q} className="glass overflow-hidden rounded-2xl">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                    onClick={() => setOpenFaq(open ? null : i)}
                  >
                    <span className="text-sm font-medium text-white">
                      {item.q}
                    </span>
                    <span className="text-cyan-neon">{open ? "−" : "+"}</span>
                  </button>
                  {open ? (
                    <p className="border-t border-white/5 px-4 py-3 text-sm leading-relaxed text-zinc-400">
                      {item.a}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </section>
        )}

        {tab === "lead" && (
          <section>
            <h2 className="font-display text-lg font-semibold text-white">
              Заявка
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Придёт менеджеру в Telegram. Ответим здесь или в личке.
            </p>

            {status === "ok" ? (
              <div className="glass mt-5 rounded-2xl p-5">
                <p className="font-display text-lg text-white">Заявка ушла ✅</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Мы получили её и скоро ответим.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-4 rounded-full bg-neon-gradient px-5 py-2.5 text-sm font-semibold text-void"
                >
                  Отправить ещё
                </button>
              </div>
            ) : (
              <form onSubmit={submitLead} className="mt-5 space-y-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs text-zinc-500">Имя</span>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm outline-none focus:border-cyan-neon/40"
                    placeholder="Как к вам обращаться"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs text-zinc-500">
                    Telegram или телефон
                  </span>
                  <input
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm outline-none focus:border-cyan-neon/40"
                    placeholder="@username или +7…"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs text-zinc-500">Тип</span>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#121216] px-3 py-3 text-sm outline-none focus:border-cyan-neon/40"
                  >
                    {typeOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs text-zinc-500">
                    Что нужно сделать
                  </span>
                  <textarea
                    required
                    minLength={10}
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm outline-none focus:border-cyan-neon/40"
                    placeholder="2–3 предложения о задаче"
                  />
                </label>
                <label className="flex items-start gap-3 text-sm text-zinc-400">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5"
                    required
                  />
                  <span>
                    Согласен на обработку данных.{" "}
                    <Link
                      href="/privacy"
                      className="text-cyan-neon underline-offset-2 hover:underline"
                    >
                      Политика
                    </Link>
                  </span>
                </label>
                {error ? (
                  <p className="text-sm text-red-400">{error}</p>
                ) : null}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full rounded-full bg-neon-gradient py-3 font-display text-sm font-semibold text-void disabled:opacity-60"
                >
                  {status === "loading" ? "Отправляем…" : "Отправить заявку"}
                </button>
              </form>
            )}
          </section>
        )}

        {tab === "admin" && isAdminUser && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold text-white">
                CRM
              </h2>
              <button
                type="button"
                onClick={() => void loadCrm()}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-400"
              >
                Обновить
              </button>
            </div>

            {leadStatsView ? (
              <div className="glass grid grid-cols-4 gap-2 rounded-2xl p-3 text-center">
                {(
                  [
                    ["new", leadStatsView.new],
                    ["progress", leadStatsView.progress],
                    ["wait", leadStatsView.wait],
                    ["done", leadStatsView.done],
                  ] as const
                ).map(([key, n]) => (
                  <div key={key}>
                    <p className="font-display text-lg text-white">{n}</p>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                      {key}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            {crmLoading && !leads.length ? (
              <p className="text-sm text-zinc-500">Загрузка…</p>
            ) : null}

            {!crmLoading && !leads.length ? (
              <div className="glass rounded-2xl p-5 text-sm text-zinc-400">
                Заявок пока нет.
              </div>
            ) : null}

            {leads.map((lead) => {
              const busy = crmBusyId === lead.id;
              return (
                <article key={lead.id} className="glass rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-display text-base font-semibold text-white">
                        {lead.name}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {lead.username ? `@${lead.username}` : `id ${lead.fromId ?? lead.chatId}`}
                        {" · "}
                        {new Date(lead.at).toLocaleString("ru-RU", {
                          timeZone: "Europe/Moscow",
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${statusPillClass(lead.status, true)}`}
                    >
                      {lead.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-zinc-300">{lead.contact}</p>
                  <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-zinc-400">
                    {lead.task}
                  </p>

                  {lead.tags?.length ? (
                    <p className="mt-2 text-xs text-amber-300/80">
                      {lead.tags.map((t) => `#${t}`).join(" ")}
                    </p>
                  ) : null}
                  {lead.assigneeId ? (
                    <p className="mt-1 text-[11px] text-zinc-500">
                      assignee {lead.assigneeId}
                    </p>
                  ) : null}
                  {lead.notes?.[0] ? (
                    <p className="mt-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs text-zinc-400">
                      {lead.notes[0].text}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {STATUS_PILLS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        disabled={busy || lead.status === s.id}
                        onClick={() => void patchLead(lead.id, { status: s.id })}
                        className={`rounded-full border px-2.5 py-1 text-[11px] disabled:opacity-40 ${statusPillClass(s.id, lead.status === s.id)}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void patchLead(lead.id, { assigneeSelf: true })
                      }
                      className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 disabled:opacity-40"
                    >
                      Моя
                    </button>
                    <button
                      type="button"
                      disabled={busy || lead.tags?.includes("hot")}
                      onClick={() => void patchLead(lead.id, { tag: "hot" })}
                      className="rounded-full border border-amber-400/30 px-3 py-1.5 text-xs text-amber-300 disabled:opacity-40"
                    >
                      hot
                    </button>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <input
                      value={noteDraft[lead.id] ?? ""}
                      onChange={(e) =>
                        setNoteDraft((prev) => ({
                          ...prev,
                          [lead.id]: e.target.value,
                        }))
                      }
                      placeholder="Заметка…"
                      className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none focus:border-cyan-neon/40"
                    />
                    <button
                      type="button"
                      disabled={busy || !(noteDraft[lead.id] || "").trim()}
                      onClick={async () => {
                        const text = (noteDraft[lead.id] || "").trim();
                        if (!text) return;
                        await patchLead(lead.id, { note: text });
                        setNoteDraft((prev) => ({ ...prev, [lead.id]: "" }));
                      }}
                      className="shrink-0 rounded-full bg-neon-gradient px-3 py-2 text-xs font-semibold text-void disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-[#0a0a0a]/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-sm">
        <div
          className={`mx-auto grid max-w-lg gap-1 px-2 ${
            isAdminUser ? "grid-cols-6" : "grid-cols-5"
          }`}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => go(t.id)}
              className={`rounded-xl px-1 py-2.5 text-center text-[11px] font-medium ${
                tab === t.id
                  ? "bg-cyan-neon/15 text-cyan-neon"
                  : "text-zinc-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
