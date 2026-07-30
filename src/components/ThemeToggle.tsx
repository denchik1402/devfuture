"use client";

import { memo } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isLight ? "Включить тёмную тему" : "Включить светлую тему"}
      title={isLight ? "Тёмная тема" : "Светлая тема"}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition hover:border-cyan-neon/40 hover:text-cyan-neon focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-neon ${className}`}
    >
      {isLight ? (
        <Moon className="h-4 w-4" strokeWidth={1.75} />
      ) : (
        <Sun className="h-4 w-4" strokeWidth={1.75} />
      )}
    </button>
  );
}

export default memo(ThemeToggle);
