"use client";

import { MotionConfig } from "framer-motion";

/** Force Framer Motion animations on even when OS has reduced-motion enabled. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="never">{children}</MotionConfig>;
}
