"use client";

import { memo } from "react";

const TECHS = [
  "React",
  "Next.js",
  "TypeScript",
  "Python",
  "Electron",
  "Tauri",
  "Node.js",
  "Telegram Bot API",
  "Aiogram",
  "PostgreSQL",
  "SQLite",
  "Tailwind CSS",
  "OpenAI API",
  "REST API",
  "Docker",
];

function TechMarquee() {
  const row = [...TECHS, ...TECHS];

  return (
    <div className="relative w-full overflow-hidden border-y border-white/5 bg-white/[0.02] py-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-void to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-void to-transparent" />

      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {row.map((tech, i) => (
          <span
            key={`${tech}-${i}`}
            className="font-display text-sm uppercase tracking-[0.2em] text-zinc-500"
          >
            <span className="mr-3 text-cyan-neon/60">◆</span>
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}

export default memo(TechMarquee);
