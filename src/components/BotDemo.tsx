"use client";

import { memo, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Check, ChevronRight } from "lucide-react";
import { reachGoal } from "@/lib/analytics";
import { siteConfig } from "@/lib/site";
import NeonButton from "./NeonButton";

const DEMO_STEPS = [
  {
    from: "bot" as const,
    text: "Здравствуйте! Выберите услугу:",
    options: ["Стрижка", "Маникюр", "Консультация"],
  },
  {
    from: "user" as const,
    text: "Стрижка",
  },
  {
    from: "bot" as const,
    text: "Отлично. На какое время удобно?",
    options: ["Сегодня 18:00", "Завтра 12:00", "Завтра 16:00"],
  },
  {
    from: "user" as const,
    text: "Завтра 12:00",
  },
  {
    from: "bot" as const,
    text: "Заявка принята. Напомним за час. Администратор уже получил уведомление.",
    options: [],
  },
];

function BotDemo() {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    setStep(0);
    setPicked([]);
  }, []);

  const visible = DEMO_STEPS.slice(0, step + 1);
  const current = DEMO_STEPS[step];
  const finished = step >= DEMO_STEPS.length - 1 && current.from === "bot";

  const onPick = (option: string) => {
    if (current.from !== "bot" || !current.options?.length) return;
    setPicked((p) => [...p, option]);
    // advance past the mirrored user line if next is user with same intent
    setStep((s) => Math.min(s + 2, DEMO_STEPS.length - 1));
  };

  return (
    <section
      id="demo"
      className="relative border-y border-white/5 bg-white/[0.02] py-16 md:py-20"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
            Интерактивное демо
          </p>
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
            Так выглядит простой бот записи
          </h2>
          <p className="mt-4 text-zinc-400">
            Нажмите варианты ответа справа — это пример сценария, который часто
            собираем и показываем в день обращения.
          </p>
          <div className="mt-8">
            <NeonButton
              href={siteConfig.telegramUrl}
              pulse
              onClick={() => reachGoal("click_telegram", { place: "bot_demo" })}
            >
              Хочу такого бота
            </NeonButton>
          </div>
        </div>

        <div className="glass overflow-hidden rounded-2xl">
          <div className="flex items-center gap-3 border-b border-white/5 bg-white/[0.03] px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-neon/15 text-cyan-neon">
              <Bot className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-sm font-medium text-white">DemoBookingBot</p>
              <p className="text-xs text-zinc-500">онлайн · демо-сценарий</p>
            </div>
          </div>

          <div className="flex min-h-[320px] flex-col gap-3 p-4">
            <AnimatePresence initial={false}>
              {visible.map((msg, i) => {
                if (msg.from === "user") {
                  const text = picked[Math.floor(i / 2)] || msg.text;
                  return (
                    <motion.div
                      key={`u-${i}-${text}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-neon-gradient px-3.5 py-2 text-sm text-void"
                    >
                      {text}
                    </motion.div>
                  );
                }
                return (
                  <motion.div
                    key={`b-${i}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mr-auto max-w-[85%] rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-zinc-200"
                  >
                    {msg.text}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {current?.from === "bot" && current.options.length > 0 && (
              <div className="mt-auto flex flex-col gap-2 pt-2">
                {current.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onPick(opt)}
                    className="flex items-center justify-between rounded-xl border border-cyan-neon/25 bg-cyan-neon/5 px-3 py-2.5 text-left text-sm text-cyan-neon transition hover:bg-cyan-neon/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon"
                  >
                    {opt}
                    <ChevronRight className="h-4 w-4 opacity-70" />
                  </button>
                ))}
              </div>
            )}

            {finished && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-auto flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-400"
              >
                <Check className="h-4 w-4 text-cyan-neon" />
                Демо завершено. Можем собрать похожий сценарий под ваш бизнес.
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(BotDemo);
