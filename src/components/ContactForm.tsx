"use client";

import { memo, useState, type FormEvent } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Reveal from "./Reveal";
import NeonButton from "./NeonButton";
import { BRIEF_TYPES } from "@/lib/content";
import { siteConfig, telegramBriefLink } from "@/lib/site";
import { reachGoal } from "@/lib/analytics";

type BriefType = (typeof BRIEF_TYPES)[number]["value"];

function ContactForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [type, setType] = useState<BriefType>(BRIEF_TYPES[0].value);
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle"
  );
  const [error, setError] = useState("");
  const [deliveredToBot, setDeliveredToBot] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    setDeliveredToBot(false);

    const payload = {
      name: name.trim(),
      contact: contact.trim(),
      type:
        BRIEF_TYPES.find((t) => t.value === type)?.label ?? type,
      message: message.trim(),
      company,
    };

    const openTelegramFallback = () => {
      const brief = [
        `Бриф DevFuture`,
        `Имя: ${payload.name}`,
        `Контакт: ${payload.contact}`,
        `Тип: ${payload.type}`,
        "",
        payload.message,
      ].join("\n");
      window.open(telegramBriefLink(brief), "_blank", "noopener,noreferrer");
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        delivered?: boolean;
        channel?: string;
        fallback?: string;
        error?: string;
      };

      if (!res.ok) {
        if (data.fallback === "telegram") {
          reachGoal("submit_brief", { channel: "fallback" });
          openTelegramFallback();
          setStatus("error");
          setError(
            data.error ||
              "Автодоставка не сработала. Откройте Telegram и отправьте бриф вручную."
          );
          return;
        }
        setStatus("error");
        setError(data.error || "Не удалось отправить. Напишите в Telegram.");
        return;
      }

      if (data.delivered && data.channel === "telegram") {
        setDeliveredToBot(true);
        reachGoal("submit_brief", { channel: "telegram" });
      } else if (data.delivered) {
        reachGoal("submit_brief", { channel: data.channel || "other" });
      }

      setStatus("ok");
      setName("");
      setContact("");
      setMessage("");
      setCompany("");
      setType(BRIEF_TYPES[0].value);
    } catch {
      setStatus("error");
      setError("Сеть недоступна. Напишите нам в Telegram.");
    }
  };

  return (
    <section id="contact" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(176,38,255,0.06),transparent_50%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
              Контакт
            </p>
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              Короткий бриф — и мы ответим
            </h2>
            <p className="mt-4 max-w-md text-zinc-400">
              Опишите задачу в нескольких предложениях. Оценим срок и формат в
              рабочий день — или сразу предложим слот на демо «в тот же день».
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <NeonButton href={siteConfig.telegramUrl} pulse>
                Telegram
              </NeonButton>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            {status === "ok" ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass flex flex-col items-start rounded-2xl p-8"
              >
                <CheckCircle2 className="h-10 w-10 text-cyan-neon" />
                <h3 className="mt-4 font-display text-xl font-semibold text-white">
                  {deliveredToBot ? "Заявка ушла в Telegram" : "Бриф принят"}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  {deliveredToBot
                    ? "Мы получили сообщение в боте и скоро ответим."
                    : "Свяжемся в ближайшее время. Можно продублировать в Telegram — так быстрее."}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <NeonButton href={siteConfig.telegramUrl}>
                    Открыть Telegram
                  </NeonButton>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="text-sm text-zinc-500 underline-offset-4 hover:text-cyan-neon hover:underline"
                  >
                    Отправить ещё
                  </button>
                </div>
              </motion.div>
            ) : (
              <form
                onSubmit={onSubmit}
                className="glass relative space-y-4 rounded-2xl p-6 md:p-8"
                noValidate
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-1.5 block text-zinc-400">Имя</span>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-neon/50 focus-visible:ring-2 focus-visible:ring-cyan-neon/30"
                      placeholder="Как к вам обращаться"
                      autoComplete="name"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1.5 block text-zinc-400">
                      Telegram / телефон
                    </span>
                    <input
                      required
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-neon/50 focus-visible:ring-2 focus-visible:ring-cyan-neon/30"
                      placeholder="@username или +7…"
                      autoComplete="tel"
                    />
                  </label>
                </div>

                <fieldset>
                  <legend className="mb-2 text-sm text-zinc-400">
                    Тип задачи
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {BRIEF_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setType(t.value)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon ${
                          type === t.value
                            ? "border-cyan-neon/50 bg-cyan-neon/10 text-cyan-neon"
                            : "border-white/10 text-zinc-400 hover:border-white/20"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <label className="block text-sm">
                  <span className="mb-1.5 block text-zinc-400">
                    Что нужно сделать
                  </span>
                  <textarea
                    required
                    minLength={10}
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-neon/50 focus-visible:ring-2 focus-visible:ring-cyan-neon/30"
                    placeholder="2–3 предложения: цель, кто пользуется, что должно произойти в итоге"
                  />
                </label>

                {/* Honeypot for bots — hidden from users */}
                <div
                  className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
                  aria-hidden="true"
                >
                  <label>
                    Company
                    <input
                      tabIndex={-1}
                      autoComplete="off"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </label>
                </div>

                {error && (
                  <p className="text-sm text-red-400" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-neon-gradient px-7 py-3.5 font-display text-sm font-semibold text-void transition hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Отправляем…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Отправить бриф
                    </>
                  )}
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default memo(ContactForm);
