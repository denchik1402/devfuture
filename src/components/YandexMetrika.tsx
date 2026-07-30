"use client";

import Script from "next/script";
import { getMetrikaId } from "@/lib/analytics";

/**
 * Yandex Metrika counter. Set NEXT_PUBLIC_YANDEX_METRIKA_ID in .env.local
 * Goals to create in Metrika UI: click_telegram, click_phone, submit_brief,
 * open_packages, open_service, open_demo, click_package, scroll_75, quiz_complete,
 * open_contact, lead_handoff, open_estimator, view_resheniya, view_case, view_blog
 */
export function YandexMetrika() {
  const id = getMetrikaId();
  if (!id) return null;

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
    <>
      <Script id="yandex-metrika" strategy="lazyOnload">
        {snippet}
      </Script>
      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc.yandex.ru/watch/${id}`}
            style={{ position: "absolute", left: "-9999px" }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
