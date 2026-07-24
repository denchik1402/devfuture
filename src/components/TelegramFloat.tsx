"use client";

import { memo } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import { telegramContactLink } from "@/lib/site";
import { reachGoal } from "@/lib/analytics";

function TelegramFloat() {
  return (
    <motion.a
      href={telegramContactLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Связаться в 1 клик — Telegram"
      title="Связаться в 1 клик"
      initial={{ opacity: 0, scale: 0.8, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      onClick={() => reachGoal("click_telegram", { place: "float_1click" })}
      className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-full bg-[#2AABEE] py-3 pl-4 pr-5 text-white shadow-[0_8px_32px_rgba(42,171,238,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon"
    >
      <Send className="h-5 w-5 translate-x-[-1px] translate-y-[1px]" strokeWidth={1.75} />
      <span className="hidden font-display text-sm font-semibold sm:inline">
        1 клик
      </span>
      <span className="sr-only">Связаться в Telegram</span>
    </motion.a>
  );
}

export default memo(TelegramFloat);
