"use client";

import { memo } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import { siteConfig } from "@/lib/site";

function TelegramFloat() {
  return (
    <motion.a
      href={siteConfig.telegramUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Написать в Telegram"
      initial={{ opacity: 0, scale: 0.8, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#2AABEE] text-white shadow-[0_8px_32px_rgba(42,171,238,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon"
    >
      <Send className="h-6 w-6 translate-x-[-1px] translate-y-[1px]" strokeWidth={1.75} />
      <span className="sr-only">Telegram</span>
    </motion.a>
  );
}

export default memo(TelegramFloat);
