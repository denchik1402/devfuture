"use client";

import { memo, useEffect, useRef } from "react";
import { reachGoal } from "@/lib/analytics";

function ScrollGoals() {
  const sent = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (sent.current) return;
      const doc = document.documentElement;
      const scrolled =
        (window.scrollY + window.innerHeight) / Math.max(doc.scrollHeight, 1);
      if (scrolled >= 0.75) {
        sent.current = true;
        reachGoal("scroll_75");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}

export default memo(ScrollGoals);
