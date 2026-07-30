"use client";

import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { reachGoal } from "@/lib/analytics";

type ButtonVariant = "primary" | "ghost";

type NeonButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: ButtonVariant;
  className?: string;
  pulse?: boolean;
  onClick?: () => void;
};

function NeonButton({
  children,
  href = "#contact",
  variant = "primary",
  className = "",
  pulse = false,
  onClick,
}: NeonButtonProps) {
  const reduceMotion = useReducedMotion();

  const base =
    "relative inline-flex items-center justify-center px-7 py-3.5 font-display text-sm font-semibold tracking-wide rounded-full select-none will-change-transform";

  const styles =
    variant === "primary"
      ? "bg-neon-gradient text-void shadow-neon"
      : "glass text-zinc-100 hover:border-cyan-neon/40 hover:text-white";

  const handleClick = () => {
    if (href.includes("t.me") || href.includes("telegram")) {
      reachGoal("click_telegram", { place: "button" });
    } else if (href.includes("packages")) {
      reachGoal("open_packages");
    }
    onClick?.();
  };

  const isExternal = href.startsWith("http");

  return (
    <motion.a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      onClick={handleClick}
      whileHover={reduceMotion ? undefined : { scale: 1.03 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      className={`${base} ${styles} ${pulse && !reduceMotion ? "animate-pulseGlow" : ""} ${className}`}
    >
      {children}
    </motion.a>
  );
}

export default memo(NeonButton);
