"use client";

import { memo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Monitor,
  LayoutDashboard,
  Globe,
  Bot,
  Workflow,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import Reveal from "./Reveal";

type Skill = {
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  tags: string[];
};

const SKILLS: Skill[] = [
  {
    title: "Сайты и лендинги",
    subtitle: "Витрина бизнеса в сети",
    description:
      "Корпоративные сайты и продающие страницы: адаптив, быстрая загрузка, формы заявок и аккуратное SEO.",
    icon: Globe,
    tags: ["Next.js", "SEO", "Формы", "Аналитика"],
  },
  {
    title: "Веб-приложения",
    subtitle: "Кабинеты и внутренние сервисы",
    description:
      "Личные кабинеты, админки, учёт заявок и рабочие панели для команды — без лишней сложности.",
    icon: LayoutDashboard,
    tags: ["React", "API", "Auth", "PostgreSQL"],
  },
  {
    title: "Десктопные приложения",
    subtitle: "Windows и macOS",
    description:
      "Утилиты и рабочие программы под ваши процессы: установка, обновления и привычный интерфейс на компьютере.",
    icon: Monitor,
    tags: ["Electron", "Tauri", "Windows", "macOS"],
  },
  {
    title: "Telegram-боты",
    subtitle: "Заявки, уведомления, сервис",
    description:
      "Боты для заявок, каталога, записи и рассылок. Простой сценарий часто готов в тот же день; сложнее — за несколько дней с админкой.",
    icon: Bot,
    tags: ["Aiogram", "Bot API", "Уведомления"],
  },
  {
    title: "Автоматизация",
    subtitle: "Интеграции без рутины",
    description:
      "Связываем CRM, таблицы, Telegram и API: меньше ручного ввода, больше предсказуемых сценариев.",
    icon: Workflow,
    tags: ["CRM", "REST", "Webhook", "Скрипты"],
  },
  {
    title: "AI-сценарии",
    subtitle: "Умные помощники",
    description:
      "Ассистенты для FAQ, черновиков ответов и внутренних подсказок на базе LLM — там, где это реально экономит время.",
    icon: Sparkles,
    tags: ["OpenAI", "Промпты", "Боты"],
  },
];

function Skills() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCard = useCallback((dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 340, behavior: "smooth" });
  }, []);

  return (
    <section id="skills" className="relative py-24 md:py-32 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(176,38,255,0.08),transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="flex items-end justify-between gap-4">
          <Reveal>
            <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
              Компетенции
            </p>
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              Что мы делаем
            </h2>
            <p className="mt-4 max-w-xl text-zinc-400">
              Практичные цифровые продукты среднего масштаба — от идеи и ТЗ до
              релиза и поддержки.
            </p>
          </Reveal>

          <div className="hidden shrink-0 gap-2 sm:flex">
            <button
              type="button"
              aria-label="Прокрутить влево"
              onClick={() => scrollByCard(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition hover:border-cyan-neon/40 hover:text-cyan-neon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Прокрутить вправо"
              onClick={() => scrollByCard(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition hover:border-cyan-neon/40 hover:text-cyan-neon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-zinc-600 sm:hidden">
          Листайте карточки в сторону →
        </p>
      </div>

      <div
        ref={trackRef}
        className="skills-track mt-12 flex gap-5 overflow-x-auto px-6 pb-4 snap-x snap-mandatory md:px-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]"
      >
        {SKILLS.map((skill, i) => {
          const Icon = skill.icon;
          return (
            <Reveal key={skill.title} delay={i * 0.06} className="shrink-0">
              <motion.article
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                className="glass group relative flex h-full w-[min(85vw,320px)] snap-start flex-col rounded-2xl p-7 overflow-hidden"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br from-cyan-neon/10 via-transparent to-purple-neon/15" />

                <div className="relative mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cyan-neon transition-transform duration-300 group-hover:scale-110 group-hover:border-cyan-neon/30">
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </div>

                <h3 className="relative font-display text-xl font-semibold text-white">
                  {skill.title}
                </h3>
                <p className="relative mt-1 text-sm text-cyan-neon/80">
                  {skill.subtitle}
                </p>
                <p className="relative mt-4 flex-1 text-sm leading-relaxed text-zinc-400">
                  {skill.description}
                </p>

                <div className="relative mt-6 flex flex-wrap gap-2">
                  {skill.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] uppercase tracking-wider text-zinc-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

export default memo(Skills);
