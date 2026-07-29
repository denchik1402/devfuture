"use client";

import { useEffect, useMemo, useState } from "react";
import { FAQ_ITEMS, PACKAGES } from "@/lib/content";
import { SERVICE_PAGES } from "@/lib/services";
import { useTelegramWebApp } from "./useTelegramWebApp";

type Tab = "home" | "offer" | "faq" | "lead";

const TABS: { id: Tab; label: string }[] = [
  { id: "home", label: "Главная" },
  { id: "offer", label: "Офер" },
  { id: "faq", label: "FAQ" },
  { id: "lead", label: "Заявка" },
];

export default function TgMiniApp() {
  const { webApp, user } = useTelegramWebApp();
  const [tab, setTab] = useState<Tab>("home");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [type, setType] = useState<string>(PACKAGES[0]?.name || "Бот-MVP");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

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
  };

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
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
          source: "telegram_mini_app",
          company: "",
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
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-[#0a0a0a]/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-sm">
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => go(t.id)}
              className={`rounded-xl px-2 py-2.5 text-center text-[11px] font-medium ${
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
