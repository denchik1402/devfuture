"use client";

import { memo } from "react";

type Props = {
  title?: string;
  steps: string[];
  /** denser phone mock for featured cases */
  variant?: "strip" | "phone";
};

function CaseBotMock({ title = "Telegram", steps, variant = "strip" }: Props) {
  if (!steps.length) return null;

  if (variant === "phone") {
    return (
      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold text-white">
          Как выглядит в мессенджере
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          Макет экранов бота — без стоковых фото, чтобы было видно сценарий.
        </p>
        <div className="mt-8 flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center lg:gap-10">
          <div className="relative w-full max-w-[280px] shrink-0">
            <div className="rounded-[2rem] border border-white/15 bg-[#0e0e12] p-3 shadow-[0_0_40px_rgba(0,240,255,0.08)]">
              <div className="mb-3 flex items-center gap-2 px-2 pt-1">
                <span className="h-8 w-8 rounded-full bg-cyan-neon/20" />
                <div>
                  <p className="font-display text-xs font-semibold text-white">
                    {title}
                  </p>
                  <p className="text-[10px] text-zinc-500">бот · онлайн</p>
                </div>
              </div>
              <div className="space-y-2 rounded-2xl bg-[#121218] px-3 py-4 min-h-[340px]">
                {steps.map((step, i) => (
                  <div
                    key={step}
                    className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                        i % 2 === 0
                          ? "rounded-tl-sm bg-white/10 text-zinc-200"
                          : "rounded-tr-sm bg-cyan-neon/20 text-cyan-neon"
                      }`}
                    >
                      {i % 2 === 0 ? (
                        <>
                          <span className="mb-1 block text-[9px] uppercase tracking-wider text-zinc-500">
                            бот
                          </span>
                          {step}
                        </>
                      ) : (
                        step
                      )}
                    </div>
                  </div>
                ))}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {steps.slice(0, 3).map((s) => (
                    <span
                      key={`btn-${s}`}
                      className="rounded-full border border-cyan-neon/30 px-2.5 py-1 text-[10px] text-cyan-neon/90"
                    >
                      {s.length > 18 ? `${s.slice(0, 16)}…` : s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <ol className="w-full max-w-md space-y-3">
            {steps.map((step, i) => (
              <li
                key={step}
                className="glass flex items-start gap-3 rounded-2xl p-4"
              >
                <span className="font-display text-xs tracking-[0.2em] text-cyan-neon/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-sm text-zinc-300">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl font-bold text-white">
        Сценарий как в боте
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-zinc-500">
        Условные экраны — без стоковых фото, чтобы было видно поток.
      </p>
      <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <div
            key={step}
            className="glass flex w-44 shrink-0 flex-col rounded-2xl p-4"
          >
            <span className="font-display text-[10px] tracking-[0.2em] text-cyan-neon/70">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="mt-3 flex min-h-[120px] flex-col justify-between rounded-xl border border-white/10 bg-[#121218] p-3">
              <div className="space-y-1.5">
                <div className="h-1.5 w-10 rounded bg-white/10" />
                <div className="rounded-lg bg-white/10 px-2 py-1.5 text-[11px] text-zinc-300">
                  {step}
                </div>
                {i < steps.length - 1 ? (
                  <div className="ml-auto w-2/3 rounded-lg bg-cyan-neon/15 px-2 py-1 text-[10px] text-cyan-neon/80">
                    ок
                  </div>
                ) : null}
              </div>
              <div className="mt-3 h-6 rounded-full border border-cyan-neon/25 text-center text-[9px] leading-6 text-cyan-neon/70">
                кнопка
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default memo(CaseBotMock);
