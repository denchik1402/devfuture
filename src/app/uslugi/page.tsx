import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TelegramFloat from "@/components/TelegramFloat";
import { SERVICE_PAGES } from "@/lib/services";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Услуги",
  description:
    "Telegram-боты, сайты и лендинги, веб-приложения и десктопные программы от DevFuture. MVP от 1 дня.",
  alternates: { canonical: "/uslugi" },
};

export default function ServicesIndexPage() {
  return (
    <main className="relative min-h-screen bg-void">
      <Navbar />
      <section className="relative overflow-hidden px-6 pb-20 pt-28 md:pt-32">
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />
        <div className="relative mx-auto max-w-6xl">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/80">
            Услуги
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
            Что делает {siteConfig.name}
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-400">
            Практичные цифровые продукты среднего масштаба — от быстрого бота до
            кабинета и десктоп-утилиты.
          </p>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {SERVICE_PAGES.map((s) => (
              <Link
                key={s.slug}
                href={`/uslugi/${s.slug}`}
                className="glass group rounded-2xl p-7 transition hover:border-cyan-neon/30"
              >
                <h2 className="font-display text-xl font-semibold text-white group-hover:text-cyan-neon">
                  {s.name}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {s.description}
                </p>
                <p className="mt-5 text-sm text-cyan-neon/80">
                  от {s.priceFrom} · {s.term}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
      <TelegramFloat />
    </main>
  );
}
