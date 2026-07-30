import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TelegramFloat from "@/components/TelegramFloat";
import { JsonLd } from "@/components/JsonLd";
import { SEO_LANDINGS } from "@/lib/seo-landings";
import { siteConfig } from "@/lib/site";
import { buildItemListSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Решения под ключ — боты, лендинги, кабинеты, MVP",
  description:
    "Посадочные страницы DevFuture: Telegram-бот под ключ, запись клиентов, бот для магазина, лендинг, кабинет, MVP за день.",
  alternates: { canonical: "/resheniya" },
  openGraph: {
    title: "Решения DevFuture",
    description: "Боты, лендинги, кабинеты и быстрые MVP.",
    url: `${siteConfig.url}/resheniya`,
    locale: siteConfig.locale,
    siteName: siteConfig.name,
  },
};

export default function ResheniyaIndexPage() {
  const itemList = buildItemListSchema(
    "Решения DevFuture",
    SEO_LANDINGS.map((page) => ({
      name: page.h1,
      url: `${siteConfig.url}/resheniya/${page.slug}`,
    }))
  );

  return (
    <main className="relative min-h-screen bg-void">
      <JsonLd data={itemList} />
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-28 md:pt-32">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
          Решения
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-white md:text-5xl">
          Посадочные под вашу задачу
        </h1>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Короткие страницы под популярные запросы — с ценой «от», сроком и
          CTA в Telegram.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {SEO_LANDINGS.map((page) => (
            <Link
              key={page.slug}
              href={`/resheniya/${page.slug}`}
              className="glass block rounded-2xl p-6 transition hover:border-cyan-neon/30"
            >
              <h2 className="font-display text-xl font-semibold text-white">
                {page.h1}
              </h2>
              <p className="mt-3 text-sm text-zinc-400 line-clamp-3">
                {page.description}
              </p>
              <p className="mt-4 text-sm text-cyan-neon">
                от {page.priceFrom} · {page.term}
              </p>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
      <TelegramFloat />
    </main>
  );
}
