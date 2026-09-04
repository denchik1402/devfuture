"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { getMetrikaId } from "@/lib/analytics";
import { analyticsAllowed } from "@/lib/cookie-consent";
import type { CookieConsentValue } from "@/lib/legal";

/**
 * Yandex Metrika — только после согласия на аналитику (cookie-баннер).
 * Goals: см. METRIKA.md
 */
export function YandexMetrika() {
  const id = getMetrikaId();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(analyticsAllowed());
    sync();
    const onConsent = (e: Event) => {
      const detail = (e as CustomEvent<CookieConsentValue>).detail;
      setAllowed(detail === "accepted");
    };
    window.addEventListener("df:cookie-consent", onConsent);
    return () => window.removeEventListener("df:cookie-consent", onConsent);
  }, []);

  if (!id || !allowed) return null;

  const snippet = `
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
    (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
    ym(${id}, "init", {
      clickmap:true,
      trackLinks:true,
      accurateTrackBounce:true,
      webvisor:${process.env.NEXT_PUBLIC_YANDEX_WEBVISOR === "true"}
    });
  `;

  return (
    <Script id="yandex-metrika" strategy="afterInteractive">
      {snippet}
    </Script>
  );
}
