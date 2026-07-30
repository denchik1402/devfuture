"use client";

import { memo, useEffect, useState } from "react";
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { telegramBotStartLink } from "@/lib/site";
import { reachGoal } from "@/lib/analytics";

function TelegramFloat() {
  const [hidden, setHidden] = useState(false);
  const [stickyUp, setStickyUp] = useState(false);

  useEffect(() => {
    const contact = document.getElementById("contact");
    if (!contact || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setHidden(Boolean(entry?.isIntersecting));
      },
      { rootMargin: "-10% 0px -10% 0px", threshold: 0.15 }
    );
    io.observe(contact);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const sync = () => {
      setStickyUp(document.body.dataset.quizSticky === "1");
    };
    sync();
    window.addEventListener("df:quiz-sticky-vis", sync);
    return () => window.removeEventListener("df:quiz-sticky-vis", sync);
  }, []);

  const bottom = stickyUp
    ? "max(5.5rem, calc(env(safe-area-inset-bottom) + 4.5rem))"
    : "max(1.5rem, env(safe-area-inset-bottom))";

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.a
          key="tg-float"
          href={telegramBotStartLink("order")}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Написать в Telegram"
          title="Написать в Telegram"
          initial={{ opacity: 0, scale: 0.8, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 12 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => reachGoal("click_telegram", { place: "float" })}
          className="fixed z-[60] flex items-center gap-2 rounded-full bg-[#2AABEE] py-3 pl-4 pr-5 text-white shadow-[0_8px_32px_rgba(42,171,238,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon"
          style={{
            bottom,
            right: "max(1.5rem, env(safe-area-inset-right))",
          }}
        >
          <Send
            className="h-5 w-5 translate-x-[-1px] translate-y-[1px]"
            strokeWidth={1.75}
          />
          <span className="hidden font-display text-sm font-semibold sm:inline">
            Telegram
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}

export default memo(TelegramFloat);
