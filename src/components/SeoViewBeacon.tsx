"use client";

import { useEffect } from "react";
import { reachGoal, type MetrikaGoal } from "@/lib/analytics";

type Props = {
  goal: Extract<MetrikaGoal, "view_resheniya" | "view_case" | "view_blog">;
  slug: string;
};

/** Fires once per mount for SEO funnel goals in Yandex Metrika. */
export default function SeoViewBeacon({ goal, slug }: Props) {
  useEffect(() => {
    reachGoal(goal, { slug });
  }, [goal, slug]);
  return null;
}
