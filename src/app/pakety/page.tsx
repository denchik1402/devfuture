import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TelegramFloat from "@/components/TelegramFloat";
import Packages from "@/components/Packages";
import PackageCompare from "@/components/PackageCompare";
import { JsonLd } from "@/components/JsonLd";
import { FAQ_ITEMS } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Пакеты и цены",
  description:
    "Ориентиры DevFuture: бот-MVP, лендинг, кабинет/веб и абонемент поддержки. Цены «от» после короткого описания задачи.",
  alternates: { canonical: "/pakety" },
  openGraph: {
    title: "Пакеты и цены — DevFuture",
    description:
      "Стартовые пакеты разработки: бот, лендинг, веб-кабинет и поддержка.",
    url: `${siteConfig.url}/pakety`,
    locale: siteConfig.locale,
    siteName: siteConfig.name,
  },
};

const FAQ_SNIPPET = FAQ_ITEMS.slice(0, 4);

export default function PaketyPage() {
  const crumbs = buildBreadcrumbSchema([
    { name: "Главная", path: "/" },
    { name: "Пакеты и цены", path: "/pakety" },
  ]);

  return (
    <main className="relative min-h-screen bg-void">
      <JsonLd data={[buildFaqSchema(FAQ_SNIPPET), crumbs]} />
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 pb-4 pt-28 md:pt-32">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
          Пакеты и цены
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-white md:text-5xl">
          Ориентиры по стоимости
        </h1>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Выберите формат ближе к задаче — точную смету зафиксируем до старта.
          Сравните пакеты ниже или опишите задачу в квизе.
        </p>
      </div>

      <Packages />
      <PackageCompare />

      <section className="relative pb-24 pt-8 md:pb-32">
        <div className="mx-auto max-w-3xl px-6">
          <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
            FAQ
          </p>
          <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
            Частые вопросы
          </h2>
          <div className="mt-8 space-y-3">
            {FAQ_SNIPPET.map((item) => (
              <details
                key={item.q}
                className="glass group rounded-2xl open:border-cyan-neon/20"
              >
                <summary className="cursor-pointer list-none px-6 py-5 font-display text-sm font-medium text-white marker:content-none [&::-webkit-details-marker]:hidden sm:text-base">
                  {item.q}
                </summary>
                <p className="border-t border-white/5 px-6 pb-5 pt-3 text-sm leading-relaxed text-zinc-400">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <TelegramFloat />
    </main>
  );
}
