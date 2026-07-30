"use client";

import { MotionConfig } from "framer-motion";

/** Respect OS/browser reduced-motion preference for Framer Motion. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
