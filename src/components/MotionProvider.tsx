"use client";

import { MotionConfig } from "framer-motion";

/** Product choice: always animate — ignore OS reduced-motion. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="never">{children}</MotionConfig>;
}
