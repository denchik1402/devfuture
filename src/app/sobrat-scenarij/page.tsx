import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TelegramFloat from "@/components/TelegramFloat";
import { JsonLd } from "@/components/JsonLd";
import { siteConfig } from "@/lib/site";
import { buildBreadcrumbSchema, buildHowToSchema } from "@/lib/seo";
import ScenarioWizard from "./ScenarioWizard";

export const metadata: Metadata = {
  title: "Собрать сценарий Telegram-бота",
  description:
    "За 4 шага соберите черновик сценария бота: тип, меню, роли и напоминания. Скачайте .txt или напишите в Telegram.",
  alternates: { canonical: "/sobrat-scenarij" },
  openGraph: {
    title: "Собрать сценарий Telegram-бота | DevFuture",
    description:
      "Тип бота → меню → роли → напоминания. Готовый черновик сценария и демо.",
    url: `${siteConfig.url}/sobrat-scenarij`,
  },
};

const HOWTO_STEPS = [
  {
    name: "Выберите тип бота",
    text: "Запись, заявки, магазин/доставка, школа или другое.",
  },
  {
    name: "Отметьте пункты меню",
    text: "Услуги, слоты, каталог, статусы, FAQ, роли — что нужно в первой версии.",
  },
  {
    name: "Укажите роли",
    text: "Без ролей, админ+клиент или с курьером/сотрудником.",
  },
  {
    name: "Нужны ли напоминания",
    text: "Да или нет — для визитов, заказов и дедлайнов.",
  },
];

export default function SobratScenarijPage() {
  const crumbs = buildBreadcrumbSchema([
    { name: "Главная", path: "/" },
    { name: "Собрать сценарий", path: "/sobrat-scenarij" },
  ]);
  const howTo = buildHowToSchema({
    name: "Как собрать сценарий Telegram-бота",
    description:
      "Четыре шага: тип бота, пункты меню, роли и напоминания — затем сводка сценария.",
    url: `${siteConfig.url}/sobrat-scenarij`,
    steps: HOWTO_STEPS,
  });

  return (
    <main className="relative min-h-screen bg-void">
      <JsonLd data={[howTo, crumbs]} />
      <Navbar />

      <article className="relative overflow-hidden pb-8 pt-28 md:pt-32">
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />
        <div className="relative mx-auto max-w-3xl px-6">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
            Конструктор
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold text-white md:text-5xl">
            Собрать сценарий бота
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
            Четыре ответа — черновик сценария. Напишите в Telegram, распечатайте
            заявку или скачайте текст.
          </p>

          <div className="mt-10">
            <ScenarioWizard />
          </div>

          <p className="mt-12 text-sm text-zinc-500">
            Дальше:{" "}
            <Link href="/kak-rabotaem" className="text-cyan-neon hover:underline">
              как работаем
            </Link>
            ,{" "}
            <Link href="/keysy" className="text-cyan-neon hover:underline">
              кейсы
            </Link>
            ,{" "}
            <Link href="/#quiz" className="text-cyan-neon hover:underline">
              квиз
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
