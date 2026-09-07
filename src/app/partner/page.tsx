import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TelegramFloat from "@/components/TelegramFloat";
import NeonButton from "@/components/NeonButton";
import { CTA } from "@/lib/cta";
import { siteConfig, telegramBotStartLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Партнёрам — UTM и Telegram",
  description:
    "Как партнёрам DevFuture размечать трафик параметром partner= и вести лиды в Telegram-бота. Без личного кабинета.",
  alternates: { canonical: "/partner" },
  robots: { index: true, follow: true },
};

export default function PartnerPage() {
  const example = `${siteConfig.url}/?partner=your_id`;
  const botExample = telegramBotStartLink("partner_your_id");

  return (
    <main className="relative min-h-screen bg-void">
      <Navbar />
      <article className="relative mx-auto max-w-2xl px-6 pb-24 pt-28 md:pt-32">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
          Партнёрам
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
          Разметка трафика без кабинета
        </h1>
        <p className="mt-4 text-zinc-400">
          Отдельной авторизации нет: достаточно ссылок с параметром{" "}
          <code className="text-cyan-neon/90">partner=</code> и Telegram-бота.
          В заявке источник сохранится как{" "}
          <code className="text-zinc-300">partner:…</code> вместе с UTM, если
          они есть.
        </p>

        <section className="glass mt-10 space-y-4 rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold text-white">
            1. Ссылка на сайт
          </h2>
          <p className="text-sm text-zinc-400">
            Добавьте query-параметр{" "}
            <code className="text-cyan-neon/90">partner</code> к любому URL
            DevFuture. Значение — ваш короткий идентификатор (латиница, цифры,
            дефис).
          </p>
          <pre className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-zinc-300">
            {example}
          </pre>
          <p className="text-sm text-zinc-400">
            Можно комбинировать с UTM:{" "}
            <code className="text-zinc-300">
              ?utm_source=blog&amp;partner=your_id
            </code>
            .
          </p>
        </section>

        <section className="glass mt-6 space-y-4 rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold text-white">
            2. Telegram-бот
          </h2>
          <p className="text-sm text-zinc-400">
            Ведите клиента сразу в бота — заявка и переписка в одном месте.
            В payload start можно указать партнёрский тег, например{" "}
            <code className="text-zinc-300">partner_your_id</code>.
          </p>
          <pre className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-zinc-300">
            {botExample}
          </pre>
          <NeonButton href={telegramBotStartLink("order")} pulse>
            {CTA.telegram}
          </NeonButton>
        </section>

        <section className="glass mt-6 space-y-4 rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold text-white">
            3. Что видит команда
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-400">
            <li>
              В форме и квизе атрибуция читается из URL и пишется в источник
              заявки.
            </li>
            <li>Отдельного партнёрского логина или выплат в ЛК нет.</li>
            <li>
              Условия сотрудничества и оферта:{" "}
              <Link href="/oferta" className="text-cyan-neon hover:underline">
                /oferta
              </Link>
              , пакеты:{" "}
              <Link href="/pakety" className="text-cyan-neon hover:underline">
                /pakety
              </Link>
              .
            </li>
          </ul>
        </section>

        <p className="mt-10 text-sm text-zinc-500">
          Вопросы по партнёрским ссылкам —{" "}
          <a
            href={telegramBotStartLink("partner")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-neon hover:underline"
          >
            напишите в Telegram
          </a>
          .
        </p>
      </article>
      <Footer />
      <TelegramFloat />
    </main>
  );
}
