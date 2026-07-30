"use client";

import { memo } from "react";
import Link from "next/link";
import { Send, Phone } from "lucide-react";
import NeonButton from "./NeonButton";
import Reveal from "./Reveal";
import { siteConfig, telegramBotStartLink, telegramContactLink } from "@/lib/site";
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
  { label: "Конфиденциальность", href: "/privacy" },
];

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
                Связь в 1 клик через Telegram
                {siteConfig.phone ? " или звонок" : ""} — ответим по задаче и
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
              {siteConfig.phoneTel && siteConfig.phone && (
                <NeonButton href={siteConfig.phoneTel} variant="ghost">
                  Позвонить
                </NeonButton>
              )}
            </div>
          </div>
        </Reveal>

        <div className="mt-12 flex flex-col gap-8 border-t border-white/5 pt-8 md:flex-row md:items-center md:justify-between">
          <nav className="flex flex-wrap gap-6" aria-label="Навигация в подвале">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-zinc-500 transition-colors hover:text-cyan-neon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {siteConfig.phoneTel && (
              <a
                href={siteConfig.phoneTel}
                aria-label={`Позвонить ${siteConfig.phone}`}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-zinc-500 transition-colors hover:border-cyan-neon/40 hover:text-cyan-neon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon"
              >
                <Phone className="h-4 w-4" strokeWidth={1.5} />
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

        <p className="mt-10 text-xs text-zinc-600">
          © {new Date().getFullYear()} DevFuture. Все права защищены.{" "}
          <Link
            href="/privacy"
            className="underline-offset-2 hover:text-zinc-400 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon"
          >
            Политика конфиденциальности
          </Link>
        </p>
      </div>
    </footer>
  );
}

export default memo(Footer);
