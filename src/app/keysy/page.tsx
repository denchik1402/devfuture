import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TelegramFloat from "@/components/TelegramFloat";
import { CASE_PAGES } from "@/lib/cases";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Кейсы DevFuture — боты, лендинги, кабинеты",
  description:
    "Разборы сценариев: бот записи для салона, Telegram-хаб интернет-магазина, лендинг с заявками и кабинет статусов.",
  alternates: { canonical: "/keysy" },
  openGraph: {
    title: "Кейсы DevFuture",
    description: "Салон, магазин-хаб, лендинг и кабинет статусов — до/после и результат.",
    url: `${siteConfig.url}/keysy`,
    locale: siteConfig.locale,
    siteName: siteConfig.name,
  },
};

export default function KeysyIndexPage() {
  return (
    <main className="relative min-h-screen bg-void">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-28 md:pt-32">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
          Кейсы
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-white md:text-5xl">
          Как закрывали задачу
        </h1>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Анонимизированные сценарии: было → стало → результат. Без обещаний
          «как у всех» — с понятным MVP и следующим шагом в Telegram.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {CASE_PAGES.map((page) => (
            <Link
              key={page.slug}
              href={`/keysy/${page.slug}`}
              className="glass block rounded-2xl p-6 transition hover:border-cyan-neon/30"
            >
              <p className="text-xs uppercase tracking-wider text-cyan-neon/70">
                {page.category}
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold text-white">
                {page.h1}
              </h2>
              <p className="mt-3 text-sm text-zinc-400 line-clamp-3">
                {page.description}
              </p>
              <p className="mt-4 text-sm text-cyan-neon">{page.result}</p>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
      <TelegramFloat />
    </main>
  );
}
