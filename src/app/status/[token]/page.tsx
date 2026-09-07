import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TelegramFloat from "@/components/TelegramFloat";
import NeonButton from "@/components/NeonButton";
import { getDemoStatus } from "@/lib/demo-statuses";
import {
  getLeadById,
  type LeadStatus,
} from "@/lib/bot-leads";
import { siteConfig, telegramBotStartLink } from "@/lib/site";
import { CTA } from "@/lib/cta";

export const dynamic = "force-dynamic";

type Props = { params: { token: string } };

const PUBLIC_STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Новая",
  progress: "В работе",
  wait: "Ожидание",
  done: "Закрыта",
};

const LEAD_STEPS: { status: LeadStatus; label: string }[] = [
  { status: "new", label: "Заявка получена" },
  { status: "progress", label: "В работе" },
  { status: "wait", label: "Ждём уточнений / ответ" },
  { status: "done", label: "Закрыта" },
];

function truncateName(name: string, max = 24) {
  const t = name.trim();
  if (t.length <= max) return t || "Клиент";
  return `${t.slice(0, max - 1)}…`;
}

function leadStepDone(current: LeadStatus, step: LeadStatus): boolean {
  const order: LeadStatus[] = ["new", "progress", "wait", "done"];
  // wait is parallel to progress — treat as after new, before done
  if (current === "done") return true;
  if (step === "done") return false;
  if (current === "wait") {
    return step === "new" || step === "wait";
  }
  if (current === "progress") {
    return step === "new" || step === "progress";
  }
  return step === "new";
}

export function generateMetadata({ params }: Props): Metadata {
  const lead = getLeadById(params.token);
  if (lead) {
    return {
      title: `Статус заявки — ${PUBLIC_STATUS_LABEL[lead.status]}`,
      description: "Публичный статус заявки DevFuture.",
      robots: { index: false, follow: false },
      alternates: { canonical: `/status/${lead.id}` },
    };
  }

  const order = getDemoStatus(params.token);
  if (!order) {
    return {
      title: "Статус не найден",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: `${order.title} — статус`,
    description: `Публичный статус: ${order.statusLabel}. Демо-кабинет DevFuture.`,
    robots: { index: false, follow: false },
    alternates: { canonical: `/status/${order.token}` },
  };
}

function StatusShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen bg-void">
      <Navbar />
      {children}
      <Footer />
      <TelegramFloat />
    </main>
  );
}

export default function StatusTokenPage({ params }: Props) {
  const lead = getLeadById(params.token);

  if (lead) {
    const updated = new Date(lead.at).toLocaleString("ru-RU", {
      timeZone: "Europe/Moscow",
    });
    const displayName = truncateName(lead.name);

    return (
      <StatusShell>
        <article className="relative overflow-hidden pb-8 pt-28 md:pt-32">
          <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />
          <div className="relative mx-auto max-w-2xl px-6">
            <p className="font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
              Статус заявки
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
              Заявка · {displayName}
            </h1>
            <p className="mt-4 inline-flex rounded-full border border-cyan-neon/30 bg-cyan-neon/10 px-4 py-1.5 font-display text-sm text-cyan-neon">
              {PUBLIC_STATUS_LABEL[lead.status]}
            </p>
            <p className="mt-3 text-sm text-zinc-500">
              Создана: {updated} (МСК)
            </p>
            <p className="mt-2 font-display text-xs text-zinc-600">
              ID: {lead.id}
            </p>

            <ol className="glass mt-10 space-y-3 rounded-2xl p-6">
              {LEAD_STEPS.map((step, i) => {
                const done = leadStepDone(lead.status, step.status);
                return (
                  <li
                    key={step.status}
                    className="flex items-start gap-3 text-sm text-zinc-300"
                  >
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                        done
                          ? "border-cyan-neon/40 bg-cyan-neon/15 text-cyan-neon"
                          : "border-white/10 text-zinc-600"
                      }`}
                    >
                      {done ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <span className="font-display text-[10px]">{i + 1}</span>
                      )}
                    </span>
                    <span className={done ? "text-zinc-200" : "text-zinc-500"}>
                      {step.label}
                    </span>
                  </li>
                );
              })}
            </ol>

            <div className="mt-10 flex flex-wrap gap-3">
              <NeonButton href={telegramBotStartLink(`lead_${lead.id}`)} pulse>
                {CTA.telegram}
              </NeonButton>
              <NeonButton href="/#quiz" variant="ghost">
                {CTA.describe}
              </NeonButton>
            </div>

            <p className="mt-8 text-xs text-zinc-600">
              Показаны только имя (сокращённо) и статус. Текст задачи не
              публикуется · {siteConfig.name}
            </p>
          </div>
        </article>
      </StatusShell>
    );
  }

  const order = getDemoStatus(params.token);

  if (!order) {
    return (
      <StatusShell>
        <article className="relative mx-auto max-w-2xl px-6 pb-24 pt-28 md:pt-32">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
            Статус
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold text-white">
            Токен не найден
          </h1>
          <p className="mt-4 text-zinc-400">
            Публичные демо-страницы статусов:{" "}
            <Link
              href="/status/demo-alpha"
              className="text-cyan-neon hover:underline"
            >
              demo-alpha
            </Link>
            .
          </p>
        </article>
      </StatusShell>
    );
  }

  const updated = new Date(order.updatedAt).toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
  });

  return (
    <StatusShell>
      <article className="relative overflow-hidden pb-8 pt-28 md:pt-32">
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />
        <div className="relative mx-auto max-w-2xl px-6">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-cyan-neon/70">
            Публичный статус · демо
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
            {order.title}
          </h1>
          <p className="mt-4 inline-flex rounded-full border border-cyan-neon/30 bg-cyan-neon/10 px-4 py-1.5 font-display text-sm text-cyan-neon">
            {order.statusLabel}
          </p>
          <p className="mt-3 text-sm text-zinc-500">
            Обновлено: {updated} (МСК)
          </p>

          <ol className="glass mt-10 space-y-3 rounded-2xl p-6">
            {order.steps.map((step, i) => (
              <li
                key={step.label}
                className="flex items-start gap-3 text-sm text-zinc-300"
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                    step.done
                      ? "border-cyan-neon/40 bg-cyan-neon/15 text-cyan-neon"
                      : "border-white/10 text-zinc-600"
                  }`}
                >
                  {step.done ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <span className="font-display text-[10px]">{i + 1}</span>
                  )}
                </span>
                <span className={step.done ? "text-zinc-200" : "text-zinc-500"}>
                  {step.label}
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-wrap gap-3">
            <NeonButton href={telegramBotStartLink("order")} pulse>
              {CTA.telegram}
            </NeonButton>
            <NeonButton href="/kak-rabotaem" variant="ghost">
              Как работаем
            </NeonButton>
          </div>

          <p className="mt-8 text-sm text-zinc-500">
            Другие демо:{" "}
            <Link
              href="/status/demo-alpha"
              className="text-cyan-neon hover:underline"
            >
              alpha
            </Link>
            ,{" "}
            <Link
              href="/status/demo-beta"
              className="text-cyan-neon hover:underline"
            >
              beta
            </Link>
            ,{" "}
            <Link
              href="/status/demo-gamma"
              className="text-cyan-neon hover:underline"
            >
              gamma
            </Link>
            . Кейс:{" "}
            <Link
              href="/keysy/status-cabinet"
              className="text-cyan-neon hover:underline"
            >
              кабинет статусов
            </Link>
            .
          </p>

          <p className="mt-4 text-xs text-zinc-600">
            Страница только для демонстрации · {siteConfig.name}
          </p>
        </div>
      </article>
    </StatusShell>
  );
}
