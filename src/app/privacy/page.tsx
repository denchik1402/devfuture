import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description:
    "Как DevFuture обрабатывает персональные данные, полученные через сайт и Telegram-бота.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen bg-void">
      <Navbar />
      <article className="relative mx-auto max-w-3xl px-6 pb-24 pt-28 md:pt-32">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/80">
          Legal
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
          Политика конфиденциальности
        </h1>
        <p className="mt-4 text-sm text-zinc-500">
          Актуально на {new Date().toLocaleDateString("ru-RU")} ·{" "}
          {siteConfig.name} ({siteConfig.url})
        </p>

        <div className="prose-invert mt-10 space-y-8 text-sm leading-relaxed text-zinc-300">
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-white">
              1. Кто обрабатывает данные
            </h2>
            <p>
              Оператор: студия {siteConfig.name}. Контакт для вопросов по
              данным:{" "}
              <a
                className="text-cyan-neon hover:underline"
                href={siteConfig.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Telegram @{siteConfig.telegramUsername}
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-white">
              2. Какие данные собираем
            </h2>
            <p>При обращении через сайт, бота или Mini App можем получить:</p>
            <ul className="list-disc space-y-1 pl-5 text-zinc-400">
              <li>имя или обращение;</li>
              <li>контакт (Telegram, телефон, email);</li>
              <li>текст задачи / заявки;</li>
              <li>
                технические метки источника (страница, UTM, идентификаторы
                рекламных кликов);
              </li>
              <li>
                в Telegram — id чата, username и имя, которые передаёт
                мессенджер.
              </li>
            </ul>
            <p className="text-zinc-400">
              Не запрашиваем паспортные данные и не ведём обработку специальных
              категорий ПДн без отдельного основания.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-white">
              3. Зачем
            </h2>
            <p>
              Данные нужны, чтобы ответить на заявку, оценить задачу, заключить
              договор на разработку и сопровождать проект. Аналитика сайта
              (например, Яндекс Метрика) помогает улучшать страницы — при
              включённых счётчиках.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-white">
              4. Правовые основания
            </h2>
            <p>
              Обработка ведётся на основании вашего согласия (отправка формы /
              заявки в боте) и/или для подготовки и исполнения договора по вашему
              запросу (ст. 6 152-ФЗ).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-white">
              5. Где храним и кому передаём
            </h2>
            <p>
              Заявки обрабатываются на сервере проекта и дублируются в Telegram
              администраторам. По желанию оператора заявка может уходить во
              внешний CRM-webhook (таблицы / Make / Zapier). Хостинг и мессенджер
              выступают обработчиками в рамках их политик.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-white">
              6. Срок хранения
            </h2>
            <p>
              Заявки хранятся столько, сколько нужно для коммуникации и учёта
              проектов, либо до вашего отзыва — если нет иных законных
              оснований продолжать обработку. Технические логи ротируются в
              разумные сроки.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-white">
              7. Ваши права
            </h2>
            <p>
              Вы можете запросить уточнение, ограничение или удаление данных,
              отозвать согласие и получить информацию об обработке — напишите в{" "}
              <a
                className="text-cyan-neon hover:underline"
                href={siteConfig.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Telegram
              </a>
              . Отзыв согласия не влияет на законность обработки до момента
              отзыва.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-white">
              8. Cookies и метрика
            </h2>
            <p>
              Сайт может использовать необходимые cookie и счётчик аналитики.
              Отключить персонализированную аналитику можно настройками
              браузера / блокировщиками и средствами Яндекс Метрики.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-white">
              9. Изменения
            </h2>
            <p>
              Актуальная версия всегда на этой странице. Существенные изменения
              отразим датой обновления выше.
            </p>
          </section>
        </div>

        <p className="mt-12 text-sm text-zinc-500">
          <Link href="/" className="text-cyan-neon hover:underline">
            ← На главную
          </Link>
        </p>
      </article>
      <Footer />
    </main>
  );
}
