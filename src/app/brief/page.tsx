import { Suspense } from "react";
import type { Metadata } from "next";
import BriefClient from "./BriefClient";

export const metadata: Metadata = {
  title: "Бриф DevFuture",
  description: "Печатный one-pager брифа для отправки команде DevFuture.",
  robots: { index: false, follow: false },
};

export default function BriefPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-void px-6 pt-28 text-zinc-400">
          Загрузка брифа…
        </main>
      }
    >
      <BriefClient />
    </Suspense>
  );
}
