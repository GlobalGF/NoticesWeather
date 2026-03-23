/**
 * AdUnit — Google AdSense ad unit.
 *
 * Lazy-loaded on mount to avoid blocking LCP.
 * Renders nothing until the AdSense script has loaded.
 * Position variants: 'hero' | 'mid-content' | 'bottom'
 *
 * Usage:
 *   <AdUnit slot="1234567890" position="mid-content" />
 *
 * NOTE: Replace data-ad-client and slot values with real ones
 * once AdSense is approved.
 */

"use client";

import { useEffect, useRef } from "react";

interface AdUnitProps {
    /** AdSense ad slot ID */
    slot: string;
    /** Optional format override */
    format?: "auto" | "fluid" | "rectangle";
    /** Placement context — used to apply spacing styles */
    position?: "hero" | "mid-content" | "bottom";
    className?: string;
}

declare global {
    interface Window {
        adsbygoogle: unknown[];
    }
}

const PUBLISHER_ID =
    process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ?? "ca-pub-XXXXXXXXXXXXXXXX";

export function AdUnit({
    slot,
    format = "auto",
    position = "mid-content",
    className = "",
}: AdUnitProps) {
    const pushed = useRef(false);

    useEffect(() => {
        // Only push once per mount — prevents duplicate ad requests on HMR
        if (pushed.current) return;
        pushed.current = true;
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch { }
    }, []);

    const positionClass: Record<NonNullable<AdUnitProps["position"]>, string> = {
        hero: "my-4",
        "mid-content": "my-8",
        bottom: "mt-10 mb-4",
    };

    return (
        <div
            className={`${positionClass[position]} overflow-hidden text-center ${className}`}
            aria-label="Publicidad"
        >
            <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client={PUBLISHER_ID}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        </div>
    );
}
