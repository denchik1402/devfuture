"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NeonButton from "@/components/NeonButton";
import { BRIEF_TYPES } from "@/lib/content";
import { siteConfig, telegramBotStartLink } from "@/lib/site";

function resolveMessage(
  scenario: string,
  messageParam: string,
  from: string
): string {
  if (scenario) return scenario;
  if (messageParam) return messageParam;
  if (from.startsWith("case_")) {
    const slug = from.slice("case_".length) || "unknown";
    return `Черновик из кейса ${slug}: похожий сценарий для клиента`;
  }
  return "";
}

export default function BriefClient() {
  const params = useSearchParams();
  const type = params.get("type") || "bot";
  const timeline = params.get("timeline") || "";
  const budget = params.get("budget") || "";
  const from = params.get("from") || "";
  const scenario = params.get("scenario") || "";
  const messageParam = params.get("message") || "";
  const message = resolveMessage(scenario, messageParam, from);
  const name = params.get("name") || "";
  const contact = params.get("contact") || "";

  const typeLabel =
    BRIEF_TYPES.find((t) => t.value === type)?.label || type;

  const lines = useMemo(() => {
    return [
      `Бриф DevFuture`,
      `Дата: ${new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })} (МСК)`,
      "",
      name ? `Имя: ${name}` : null,
      contact ? `Контакт: ${contact}` : null,
      `Тип: ${typeLabel}`,
      timeline ? `Срок: ${timeline}` : null,
      budget ? `Бюджет: ${budget}` : null,
      "",
      "Задача:",
      message || "(дополните своими словами)",
      "",
      `Сайт: ${siteConfig.url}`,
    ].filter((x): x is string => Boolean(x));
  }, [name, contact, typeLabel, timeline, budget, message]);

  const text = lines.join("\n");

  const download = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devfuture-brief-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="relative min-h-screen bg-void print:bg-white">
      <div className="print:hidden">
        <Navbar />
      </div>
      <article className="relative mx-auto max-w-2xl px-6 pb-24 pt-28 md:pt-32 print:pt-8">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/80 print:text-black">
          Бриф
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-white print:text-black">
          One-pager для печати / PDF
        </h1>
        <p className="mt-3 text-sm text-zinc-400 print:text-zinc-700">
          Сохраните как PDF через «Печать» браузера или скачайте текст.
        </p>

        <pre className="mt-8 whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/[0.03] p-6 font-sans text-sm leading-relaxed text-zinc-200 print:border-zinc-300 print:bg-white print:text-black">
          {text}
        </pre>

        <div className="mt-8 flex flex-wrap gap-3 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-full bg-neon-gradient px-7 py-3.5 font-display text-sm font-semibold text-void"
          >
            Печать / PDF
          </button>
          <button
            type="button"
            onClick={download}
            className="glass rounded-full px-7 py-3.5 font-display text-sm font-semibold text-zinc-100"
          >
            Скачать .txt
          </button>
          <NeonButton href={telegramBotStartLink("order")} variant="ghost">
            Отправить в бота
          </NeonButton>
        </div>

        <p className="mt-10 text-sm text-zinc-500 print:hidden">
          <Link href="/#quiz" className="text-cyan-neon hover:underline">
            ← Вернуться к квизу
          </Link>
        </p>
      </article>
      <div className="print:hidden">
        <Footer />
      </div>
    </main>
  );
}
