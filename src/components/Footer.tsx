"use client";

import { memo } from "react";
import Link from "next/link";
import { Send, Phone, Mail, ChevronDown } from "lucide-react";
import NeonButton from "./NeonButton";
import Reveal from "./Reveal";
import { LegalRequisitesBlock } from "./LegalRequisites";
import { LEGAL_LINKS, legalConfig } from "@/lib/legal";
import { telegramBotStartLink, telegramContactLink } from "@/lib/site";
import { reachGoal } from "@/lib/analytics";

const LINKS = [
  { label: "Услуги", href: "/uslugi" },
  { label: "Решения", href: "/resheniya" },
  { label: "Кейсы", href: "/keysy" },
  { label: "Как работаем", href: "/kak-rabotaem" },
  { label: "Собрать сценарий", href: "/sobrat-scenarij" },
  { label: "Пакеты", href: "/#packages" },
  { label: "Демо", href: "/#demo" },
  { label: "Блог", href: "/blog" },
  { label: "Заявка", href: "/brief" },
];

const legalLinkClass =
  "text-sm text-zinc-500 transition-colors hover:text-cyan-neon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon";

function Footer() {
  return (
    <footer className="relative border-t border-white/5 pt-16 pb-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,240,255,0.05),transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <p className="font-display text-xs uppercase tracking-[0.35em] text-cyan-neon/80">
                DevFuture
              </p>
              <p className="mt-3 max-w-md text-sm text-zinc-400">
                Связь через Telegram
                {legalConfig.phone ? ", телефон" : ""}
                {legalConfig.email ? " или email" : ""} — ответим по задаче и
                срокам.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <NeonButton
                href={telegramBotStartLink("order")}
                pulse
                onClick={() =>
                  reachGoal("click_telegram", { place: "footer" })
                }
              >
                Написать в Telegram
              </NeonButton>
              {legalConfig.phoneTel && legalConfig.phone && (
                <NeonButton href={legalConfig.phoneTel} variant="ghost">
                  Позвонить
                </NeonButton>
              )}
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-8 border-t border-white/5 pt-8 md:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="mb-3 font-display text-xs uppercase tracking-[0.25em] text-zinc-500">
              Контакты
            </p>
            <dl className="space-y-2 text-sm text-zinc-400">
              {legalConfig.email && (
                <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                  <dt className="shrink-0 font-medium text-zinc-500 sm:w-28">
                    Email
                  </dt>
                  <dd>
                    <a
                      href={`mailto:${legalConfig.email}`}
                      className="text-cyan-neon hover:underline"
                    >
                      {legalConfig.email}
                    </a>
                  </dd>
                </div>
              )}
              {legalConfig.phone && legalConfig.phoneTel && (
                <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                  <dt className="shrink-0 font-medium text-zinc-500 sm:w-28">
                    Телефон
                  </dt>
                  <dd>
                    <a
                      href={legalConfig.phoneTel}
                      className="text-cyan-neon hover:underline"
                    >
                      {legalConfig.phone}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="flex flex-col gap-6">
            <nav
              className="flex flex-wrap gap-x-6 gap-y-3"
              aria-label="Навигация в подвале"
            >
              {LINKS.map((link) => (
                <Link key={link.href} href={link.href} className={legalLinkClass}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div aria-label="Правовая информация">
              <nav className="flex flex-wrap gap-x-6 gap-y-2">
                {LEGAL_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={legalLinkClass}
                  >
                    {link.label}
                  </Link>
                ))}
                <details className="group relative inline-block">
                  <summary
                    className={`${legalLinkClass} inline-flex cursor-pointer list-none items-center gap-1 [&::-webkit-details-marker]:hidden`}
                  >
                    Реквизиты исполнителя
                    <ChevronDown
                      className="h-3.5 w-3.5 shrink-0 opacity-70 transition group-open:rotate-180"
                      strokeWidth={1.75}
                    />
                  </summary>
                  <div className="absolute left-0 top-full z-20 mt-2 w-[min(100vw-2rem,22rem)] rounded-xl border border-white/10 bg-void/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
                    <LegalRequisitesBlock variant="identity" accent />
                  </div>
                </details>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {legalConfig.phoneTel && (
                <a
                  href={legalConfig.phoneTel}
                  aria-label={`Позвонить ${legalConfig.phone}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-zinc-500 transition-colors hover:border-cyan-neon/40 hover:text-cyan-neon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon"
                >
                  <Phone className="h-4 w-4" strokeWidth={1.5} />
                </a>
              )}
              {legalConfig.email && (
                <a
                  href={`mailto:${legalConfig.email}`}
                  aria-label={`Написать на ${legalConfig.email}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-zinc-500 transition-colors hover:border-cyan-neon/40 hover:text-cyan-neon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon"
                >
                  <Mail className="h-4 w-4" strokeWidth={1.5} />
                </a>
              )}
              <a
                href={telegramContactLink()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Связаться в Telegram"
                onClick={() =>
                  reachGoal("click_telegram", { place: "footer_icon" })
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-zinc-500 transition-colors hover:border-cyan-neon/40 hover:text-cyan-neon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon"
              >
                <Send className="h-4 w-4" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>

        <p className="mt-10 text-xs text-zinc-600">
          © {new Date().getFullYear()} DevFuture. 0+ · Все права защищены.
        </p>
      </div>
    </footer>
  );
}

export default memo(Footer);
