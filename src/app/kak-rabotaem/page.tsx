import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TelegramFloat from "@/components/TelegramFloat";
import NeonButton from "@/components/NeonButton";
import { JsonLd } from "@/components/JsonLd";
import { telegramBotStartLink, telegramContactLink } from "@/lib/site";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/seo";
import { PACKAGES } from "@/lib/content";

export const metadata: Metadata = {
  title: "Как мы работаем — этапы, доступы и сопровождение",
  description:
    "Процесс DevFuture: задача → демо → смета → итерации. Код и доступы у вас. Что входит в MVP и что остаётся на второй этап. Абонемент поддержки от 15 000 ₽/мес.",
  alternates: { canonical: "/kak-rabotaem" },
};

const STEPS = [
  {
    title: "Задача и демо",
    text: "Коротко фиксируем задачу. Для простого бота часто показываем рабочее демо в день обращения — вы кликаете сценарий до оплаты полной сметы.",
  },
  {
    title: "Смета и объём",
    text: "Согласуем этап 1 / этап 2: что входит в первую версию и что сознательно откладываем. Цена и срок — до старта работ.",
  },
  {
    title: "Итерации",
    text: "Короткие демо, правки по сценарию, без сюрприза «в конце спринта». Статус прозрачен в чате.",
  },
  {
    title: "Релиз и доступы",
    text: "Код, бот, хостинг и ключи — у вас. Мы не держим продукт «в заложниках» на чужом аккаунте.",
  },
  {
    title: "Сопровождение",
    text: "Мелкие правки, обновления API, новые ветки сценария. Абонемент поддержки — если нужна постоянная команда рядом.",
  },
];

const NOT_IN_MVP = [
  "Полная замена CRM / МИС / 1С «с нуля»",
  "Безлимитные правки без этапов",
  "Дизайн брендбука и маркетинговая стратегия",
  "Десять ролей и оплат в первой версии без необходимости",
];

const GUARANTEES = [
  "Отвечаем в рабочее время в Telegram — без потери контекста между менеджером и разработкой",
  "Фиксируем объём этапа до старта; расширение — отдельной оценкой",
  "Исходники и доступы передаём вам",
  "Не обещаем «AI-магию» там, где нужен понятный сценарий кнопок",
];

const FAQ = [
  {
    q: "Где хранится код?",
    a: "В вашем репозитории или передаём архив и доступы к боту/серверу. Аккаунт BotFather — ваш.",
  },
  {
    q: "Что если задача раздулась?",
    a: "Выносим в этап 2. Не раздуваем MVP молча: сначала согласование, потом работа.",
  },
  {
    q: "Есть ли абонентское сопровождение?",
    a: "Да — абонемент поддержки от 15 000 ₽/мес: правки, мелкие фичи, мониторинг. Можно подключить после релиза.",
  },
];

export default function KakRabotaemPage() {
  const support = PACKAGES.find((p) => p.id === "support");
  const crumbs = buildBreadcrumbSchema([
    { name: "Главная", path: "/" },
    { name: "Как работаем", path: "/kak-rabotaem" },
  ]);

  return (
    <main className="relative min-h-screen bg-void">
      <JsonLd data={[buildFaqSchema(FAQ), crumbs]} />
      <Navbar />

      <article className="relative overflow-hidden pb-8 pt-28 md:pt-32">
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />
        <div className="relative mx-auto max-w-6xl px-6">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
            Процесс
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold text-white md:text-5xl">
            Как мы работаем
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
            Один контур от первой задачи до сопровождения: демо раньше оплаты
            полной сметы, код у вас, без раздувания MVP.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <NeonButton href={telegramContactLink()} pulse>
              Написать в Telegram
            </NeonButton>
            <NeonButton href="/#quiz" variant="ghost">
              Описать задачу
            </NeonButton>
          </div>

          <section className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="glass rounded-2xl p-6">
                <span className="font-display text-xs tracking-[0.25em] text-purple-neon">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-3 font-display text-lg font-semibold text-white">
                  {s.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {s.text}
                </p>
              </div>
            ))}
          </section>

          <section className="mt-14 grid gap-6 md:grid-cols-2">
            <div className="glass rounded-2xl p-7">
              <h2 className="font-display text-xl font-semibold text-white">
                Что обычно не входит в MVP
              </h2>
              <ul className="mt-5 space-y-3">
                {NOT_IN_MVP.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-zinc-400"
                  >
                    <span className="mt-1 text-zinc-600">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass rounded-2xl p-7">
              <h2 className="font-display text-xl font-semibold text-white">
                На что можно опереться
              </h2>
              <ul className="mt-5 space-y-3">
                {GUARANTEES.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-zinc-400"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-neon" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {support && (
            <section className="glass mt-14 rounded-2xl p-7 md:p-8">
              <p className="font-display text-xs uppercase tracking-[0.3em] text-purple-neon">
                Абонемент поддержки
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-white">
                {support.name} — от {support.priceFrom}
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-zinc-400">
                {support.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <NeonButton href={telegramBotStartLink("support")} pulse>
                  Обсудить сопровождение
                </NeonButton>
                <NeonButton href="/#packages" variant="ghost">
                  Все пакеты
                </NeonButton>
              </div>
            </section>
          )}

          <section className="mt-14">
            <h2 className="font-display text-2xl font-bold text-white">
              Частые вопросы
            </h2>
            <div className="mt-6 space-y-3">
              {FAQ.map((item) => (
                <div key={item.q} className="glass rounded-2xl p-6">
                  <h3 className="font-display text-base font-medium text-white">
                    {item.q}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <p className="mt-12 text-sm text-zinc-500">
            Также:{" "}
            <Link href="/resheniya" className="text-cyan-neon hover:underline">
              решения
            </Link>
            ,{" "}
            <Link href="/keysy" className="text-cyan-neon hover:underline">
              кейсы
            </Link>
            ,{" "}
            <Link href="/sobrat-scenarij" className="text-cyan-neon hover:underline">
              собрать сценарий
            </Link>
            .
          </p>
        </div>
      </article>

      <Footer />
      <TelegramFloat />
    </main>
  );
}
