"use client";

import { memo } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import NeonButton from "./NeonButton";
import Reveal from "./Reveal";
import { siteConfig } from "@/lib/site";

const LINKS = [
  { label: "Услуги", href: "/uslugi" },
  { label: "Пакеты", href: "/#packages" },
  { label: "Демо", href: "/#demo" },
  { label: "FAQ", href: "/#faq" },
  { label: "Бриф", href: "/#contact" },
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
                Пишите в Telegram — так быстрее всего ответим по задаче и срокам.
              </p>
            </div>
            <NeonButton href={siteConfig.telegramUrl} pulse>
              Написать в Telegram
            </NeonButton>
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

          <a
            href={siteConfig.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-zinc-500 transition-colors hover:border-cyan-neon/40 hover:text-cyan-neon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon"
          >
            <Send className="h-4 w-4" strokeWidth={1.5} />
          </a>
        </div>

        <p className="mt-10 text-xs text-zinc-600">
          © {new Date().getFullYear()} DevFuture. Все права защищены.
        </p>
      </div>
    </footer>
  );
}

export default memo(Footer);
