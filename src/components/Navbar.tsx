"use client";

import { memo, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { telegramBotStartLink } from "@/lib/site";
import { reachGoal } from "@/lib/analytics";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { label: "Услуги", href: "/uslugi" },
  { label: "Решения", href: "/resheniya" },
  { label: "Кейсы", href: "/keysy" },
  { label: "Как работаем", href: "/kak-rabotaem" },
  { label: "Пакеты", href: "/#packages" },
  { label: "Демо", href: "/#demo" },
  { label: "Блог", href: "/blog" },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    closeBtnRef.current?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-white/5 bg-void/90" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon"
        >
          Dev<span className="text-neon">Future</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Основная">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-zinc-400 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon"
            >
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
          <a
            href={telegramBotStartLink("order")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => reachGoal("click_telegram", { place: "nav" })}
            className="rounded-full bg-neon-gradient px-4 py-2 text-sm font-semibold text-void transition-transform hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Telegram
          </a>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="text-zinc-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={open}
            aria-controls={menuId}
            aria-haspopup="dialog"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="dialog"
            aria-modal="true"
            aria-label="Мобильное меню"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-white/5 bg-void/95 md:hidden"
          >
            <div className="flex items-center justify-end px-4 pt-2">
              <button
                ref={closeBtnRef}
                type="button"
                className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon"
                aria-label="Закрыть меню"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 px-6 pb-4" aria-label="Мобильная">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm text-zinc-300 hover:bg-white/5"
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={telegramBotStartLink("order")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setOpen(false);
                  reachGoal("click_telegram", { place: "nav_mobile" });
                }}
                className="mt-2 rounded-full bg-neon-gradient px-4 py-3 text-center text-sm font-semibold text-void"
              >
                Написать в Telegram
              </a>
              <Link
                href="/#quiz"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-center text-sm text-zinc-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon"
              >
                Описать задачу
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default memo(Navbar);
