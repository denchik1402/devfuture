"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import NeonButton from "./NeonButton";
import { telegramBotStartLink } from "@/lib/site";
import { reachGoal } from "@/lib/analytics";

type QuizStickyDetail = {
  type?: string;
  timeline?: string;
  budget?: string;
  message?: string;
};

function readPrefill(): QuizStickyDetail | null {
  try {
    const raw = sessionStorage.getItem("df_quiz_prefill");
    if (!raw) return null;
    return JSON.parse(raw) as QuizStickyDetail;
  } catch {
    return null;
  }
}

function setStickyVis(on: boolean) {
  if (typeof document === "undefined") return;
  if (on) document.body.dataset.quizSticky = "1";
  else delete document.body.dataset.quizSticky;
  window.dispatchEvent(new Event("df:quiz-sticky-vis"));
}

function QuizStickyBar() {
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState<QuizStickyDetail | null>(null);

  const show = useCallback((next: QuizStickyDetail | null) => {
    if (!next) return;
    setDetail(next);
    setVisible(true);
    setStickyVis(true);
  }, []);

  useEffect(() => {
    show(readPrefill());

    const onSticky = (e: Event) => {
      const ce = e as CustomEvent<QuizStickyDetail>;
      show(ce.detail ?? readPrefill());
    };

    window.addEventListener("df:quiz-sticky", onSticky);
    return () => {
      window.removeEventListener("df:quiz-sticky", onSticky);
      setStickyVis(false);
    };
  }, [show]);

  const printHref = useMemo(() => {
    const params = new URLSearchParams();
    if (detail?.type) params.set("type", detail.type);
    if (detail?.timeline) params.set("timeline", detail.timeline);
    if (detail?.budget) params.set("budget", detail.budget);
    if (detail?.message) params.set("message", detail.message);
    const q = params.toString();
    return q ? `/brief?${q}` : "/brief";
  }, [detail]);

  const goToContact = () => {
    reachGoal("open_contact", { place: "quiz_sticky" });
    const el = document.getElementById("contact");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.dispatchEvent(new Event("df:quiz-prefill"));
    }
  };

  const dismiss = () => {
    setVisible(false);
    setStickyVis(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="quiz-sticky"
          role="region"
          aria-label="Продолжить заявку"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="fixed inset-x-0 z-[55] border-t border-white/10 bg-void/90 backdrop-blur-md"
          style={{
            bottom: 0,
            paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
            paddingLeft: "max(1rem, env(safe-area-inset-left))",
            paddingRight: "max(1rem, env(safe-area-inset-right))",
          }}
        >
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
            <p className="hidden min-w-0 flex-1 font-display text-sm text-zinc-300 sm:block">
              Задача собрана — отправьте форму или напишите в Telegram.
            </p>
            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:flex-none">
              <NeonButton
                href={telegramBotStartLink("order")}
                pulse
                className="!px-4 !py-2.5 text-xs sm:text-sm"
                onClick={() =>
                  reachGoal("click_telegram", { place: "quiz_sticky" })
                }
              >
                Написать в Telegram
              </NeonButton>
              <NeonButton
                href="#contact"
                variant="ghost"
                className="!px-4 !py-2.5 text-xs sm:text-sm"
                onClick={goToContact}
              >
                Форма на сайте
              </NeonButton>
              <a
                href={printHref}
                className="text-xs text-zinc-400 underline-offset-4 hover:text-cyan-neon hover:underline sm:text-sm"
              >
                Печать
              </a>
            </div>
            <button
              type="button"
              aria-label="Закрыть"
              onClick={dismiss}
              className="shrink-0 rounded-full border border-white/10 p-2 text-zinc-400 transition hover:border-white/20 hover:text-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default memo(QuizStickyBar);
