"use client";

import { memo, useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Reveal from "./Reveal";
import NeonButton from "./NeonButton";
import { BRIEF_TYPES } from "@/lib/content";
import {
  siteConfig,
  telegramBriefLink,
  telegramBotStartLink,
} from "@/lib/site";
import { formatSourceTag, loadAttribution } from "@/lib/attribution";
import { reachGoal } from "@/lib/analytics";
import { CONSENT_LABEL } from "@/lib/legal";

type BriefType = (typeof BRIEF_TYPES)[number]["value"];

function isBriefType(v: string): v is BriefType {
  return BRIEF_TYPES.some((t) => t.value === v);
}

function ContactForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [type, setType] = useState<BriefType>(BRIEF_TYPES[0].value);
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [source, setSource] = useState("contact_form");
  const [consent, setConsent] = useState(false);
  const [continueInBot, setContinueInBot] = useState("");
  const [leadId, setLeadId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle"
  );
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    contact?: string;
    message?: string;
    consent?: string;
  }>({});
  const [deliveredToBot, setDeliveredToBot] = useState(false);

  const applyPrefill = useCallback(() => {
    type Prefill = {
      type?: string;
      message?: string;
      source?: string;
      name?: string;
      contact?: string;
    };
    let fromStorage: Prefill | null = null;

    try {
      const raw = sessionStorage.getItem("df_quiz_prefill");
      if (raw) {
        fromStorage = JSON.parse(raw) as Prefill;
        sessionStorage.removeItem("df_quiz_prefill");
      }
    } catch {
      // ignore
    }

    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const qIndex = hash.indexOf("?");
    const params =
      qIndex >= 0
        ? new URLSearchParams(hash.slice(qIndex + 1))
        : new URLSearchParams(
            typeof window !== "undefined" ? window.location.search : ""
          );

    const nextType = params.get("type") || fromStorage?.type;
    const nextMessage = params.get("message") || fromStorage?.message;
    const nextSource = params.get("source") || fromStorage?.source;
    const nextName = params.get("name") || fromStorage?.name;
    const nextContact = params.get("contact") || fromStorage?.contact;

    if (nextType && isBriefType(nextType)) setType(nextType);
    if (nextMessage) setMessage(nextMessage);
    if (nextSource) setSource(nextSource);
    if (nextName) setName(nextName);
    if (nextContact) setContact(nextContact);
  }, []);

  useEffect(() => {
    applyPrefill();
    const onQuiz = () => applyPrefill();
    window.addEventListener("df:quiz-prefill", onQuiz);
    return () => window.removeEventListener("df:quiz-prefill", onQuiz);
  }, [applyPrefill]);

  const validate = () => {
    const next: typeof fieldErrors = {};
    if (!name.trim()) next.name = "Укажите имя";
    if (!contact.trim()) next.contact = "Укажите Telegram или телефон";
    if (message.trim().length < 10) {
      next.message = "Опишите задачу чуть подробнее (от 10 символов)";
    }
    if (!consent) next.consent = "Нужно согласие на обработку данных";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setStatus("error");
      setError("Проверьте поля формы");
      return;
    }

    setStatus("loading");
    setError("");
    setDeliveredToBot(false);
    setContinueInBot("");
    setLeadId("");

    const payload = {
      name: name.trim(),
      contact: contact.trim(),
      type: BRIEF_TYPES.find((t) => t.value === type)?.label ?? type,
      message: message.trim(),
      company,
      source: formatSourceTag(source, loadAttribution()),
      consent: true as const,
    };

    const openTelegramFallback = () => {
      const brief = [
        `Заявка DevFuture`,
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
        leadId?: string;
        continueInBot?: string;
      };

      if (!res.ok) {
        if (data.fallback === "telegram") {
          reachGoal("submit_brief", { channel: "fallback" });
          openTelegramFallback();
          setStatus("error");
          setError(
            data.error ||
              "Автодоставка не сработала. Откройте Telegram и отправьте заявку вручную."
          );
          return;
        }
        setStatus("error");
        setError(data.error || "Не удалось отправить. Напишите в Telegram.");
        return;
      }

      if (data.continueInBot) {
        setContinueInBot(data.continueInBot);
      }
      if (data.leadId) {
        setLeadId(data.leadId);
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
      setSource("contact_form");
      setConsent(false);
      setFieldErrors({});
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
              Опишите задачу — и мы ответим
            </h2>
            <p className="mt-4 max-w-md text-zinc-400">
              Опишите задачу в нескольких предложениях. Оценим срок, формат и
              следующий шаг — обычно в рабочий день.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <NeonButton
                href={telegramBotStartLink("order")}
                pulse
                onClick={() =>
                  reachGoal("click_telegram", { place: "contact_1click" })
                }
              >
                Написать в Telegram
              </NeonButton>
              {siteConfig.phoneTel && siteConfig.phone && (
                <NeonButton
                  href={siteConfig.phoneTel}
                  variant="ghost"
                  onClick={() => reachGoal("click_phone")}
                >
                  {siteConfig.phone}
                </NeonButton>
              )}
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              Telegram откроет бота. Или опишите задачу в форме справа.
            </p>
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
                  {deliveredToBot ? "Заявка ушла в Telegram" : "Заявка принята"}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  {deliveredToBot
                    ? "Мы получили сообщение в боте и скоро ответим."
                    : "Свяжемся в ближайшее время. Можно продублировать в Telegram — так быстрее."}
                </p>
                {leadId ? (
                  <p className="mt-3 font-display text-xs text-zinc-500">
                    ID заявки:{" "}
                    <span className="text-cyan-neon/90">{leadId}</span>
                  </p>
                ) : null}
                <div className="mt-6 flex flex-wrap gap-3">
                  {continueInBot ? (
                    <NeonButton
                      href={continueInBot}
                      pulse
                      onClick={() =>
                        reachGoal("lead_handoff", {
                          place: "handoff",
                          ...(leadId ? { leadId } : {}),
                        })
                      }
                    >
                      Отслеживать в Telegram
                    </NeonButton>
                  ) : (
                    <NeonButton href={siteConfig.telegramUrl}>
                      Открыть Telegram
                    </NeonButton>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("idle");
                      setContinueInBot("");
                      setLeadId("");
                    }}
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
                {source === "homepage_quiz" ||
                source.startsWith("homepage_quiz|") ? (
                  <p className="rounded-xl border border-cyan-neon/20 bg-cyan-neon/5 px-3 py-2 text-xs text-cyan-neon/90">
                    Prefill из быстрой заявки — дополните детали и отправьте.
                  </p>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-1.5 block text-zinc-400">Имя</span>
                    <input
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (fieldErrors.name) {
                          setFieldErrors((f) => ({ ...f, name: undefined }));
                        }
                      }}
                      aria-invalid={Boolean(fieldErrors.name)}
                      aria-describedby={
                        fieldErrors.name ? "contact-name-error" : undefined
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-neon/50 focus-visible:ring-2 focus-visible:ring-cyan-neon/30"
                      placeholder="Как к вам обращаться"
                      autoComplete="name"
                    />
                    {fieldErrors.name && (
                      <p
                        id="contact-name-error"
                        className="mt-1 text-xs text-red-400"
                        role="alert"
                      >
                        {fieldErrors.name}
                      </p>
                    )}
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1.5 block text-zinc-400">
                      Telegram / телефон
                    </span>
                    <input
                      required
                      value={contact}
                      onChange={(e) => {
                        setContact(e.target.value);
                        if (fieldErrors.contact) {
                          setFieldErrors((f) => ({
                            ...f,
                            contact: undefined,
                          }));
                        }
                      }}
                      aria-invalid={Boolean(fieldErrors.contact)}
                      aria-describedby={
                        fieldErrors.contact
                          ? "contact-contact-error"
                          : undefined
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-neon/50 focus-visible:ring-2 focus-visible:ring-cyan-neon/30"
                      placeholder="@username или +7…"
                      autoComplete="tel"
                    />
                    {fieldErrors.contact && (
                      <p
                        id="contact-contact-error"
                        className="mt-1 text-xs text-red-400"
                        role="alert"
                      >
                        {fieldErrors.contact}
                      </p>
                    )}
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
                        aria-pressed={type === t.value}
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
                    onChange={(e) => {
                      setMessage(e.target.value);
                      if (fieldErrors.message) {
                        setFieldErrors((f) => ({ ...f, message: undefined }));
                      }
                    }}
                    aria-invalid={Boolean(fieldErrors.message)}
                    aria-describedby={
                      fieldErrors.message ? "contact-message-error" : undefined
                    }
                    className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-cyan-neon/50 focus-visible:ring-2 focus-visible:ring-cyan-neon/30"
                    placeholder="2–3 предложения: цель, кто пользуется, что должно произойти в итоге"
                  />
                  {fieldErrors.message && (
                    <p
                      id="contact-message-error"
                      className="mt-1 text-xs text-red-400"
                      role="alert"
                    >
                      {fieldErrors.message}
                    </p>
                  )}
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

                <label className="flex items-start gap-3 text-sm text-zinc-400">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      if (fieldErrors.consent) {
                        setFieldErrors((f) => ({ ...f, consent: undefined }));
                      }
                    }}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 text-cyan-neon focus:ring-cyan-neon/30"
                    required
                  />
                  <span>
                    {CONSENT_LABEL}{" "}
                    <Link
                      href="/privacy"
                      className="text-cyan-neon underline-offset-2 hover:underline"
                    >
                      Политика конфиденциальности
                    </Link>
                  </span>
                </label>
                {fieldErrors.consent && (
                  <p className="text-xs text-red-400" role="alert">
                    {fieldErrors.consent}
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
                      Отправить заявку
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
