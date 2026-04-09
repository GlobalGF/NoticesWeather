"use client";

import { useEffect } from "react";

export function AdSenseDeferred() {
  useEffect(() => {
    // 1. Initial delay: wait 3 seconds after hydration
    const timer = setTimeout(() => {
      // 2. Further delay: wait for first interaction (scroll/mouse/touch)
      const loadScript = () => {
        if (typeof window !== "undefined" && !document.getElementById("adsense-script")) {
          const script = document.createElement("script");
          script.id = "adsense-script";
          script.async = true;
          script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9143435761704783";
          script.crossOrigin = "anonymous";
          document.head.appendChild(script);
          
          // Clean up events
          window.removeEventListener("scroll", loadScript);
          window.removeEventListener("mousemove", loadScript);
          window.removeEventListener("touchstart", loadScript);
        }
      };

      window.addEventListener("scroll", loadScript, { passive: true });
      window.addEventListener("mousemove", loadScript, { passive: true });
      window.addEventListener("touchstart", loadScript, { passive: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return null; // Invisible component
}
