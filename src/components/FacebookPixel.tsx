"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import Script from "next/script";
import { FB_PIXEL_ID, trackPageView } from "@/lib/fbpixel";

export default function FacebookPixel() {
  const pathname = usePathname();
  const initialized = useRef(false);

  // Track page views on route changes
  useEffect(() => {
    if (!FB_PIXEL_ID) return;
    if (!initialized.current) {
      initialized.current = true;
      return; // Skip the initial mount — the inline script handles the first PageView
    }
    trackPageView();
  }, [pathname]);

  if (!FB_PIXEL_ID) return null;

  return (
    <>
      {/* Facebook Pixel base code */}
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      {/* noscript fallback — must use raw img for pixel tracking */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
