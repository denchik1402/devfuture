"use client";

import { useEffect } from "react";
import {
  readAttributionFromSearch,
  saveAttribution,
} from "@/lib/attribution";

/** Capture UTM / click ids once per session from the landing URL. */
export function AttributionCapture() {
  useEffect(() => {
    try {
      const fromUrl = readAttributionFromSearch(window.location.search);
      if (fromUrl) saveAttribution(fromUrl);
    } catch {
      // ignore
    }
  }, []);
  return null;
}
