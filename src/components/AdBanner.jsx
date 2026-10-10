"use client";

import { useEffect } from "react";

/**
 * Reusable Google AdSense ad slot component.
 * Safe for client-side navigation in Next.js.
 */
export default function AdBanner({
  dataAdSlot = "1234567890",
  dataAdFormat = "auto",
  fullWidthResponsive = true,
  className = "",
}) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    // Only attempt to push when in browser and client id is configured
    if (typeof window !== "undefined" && clientId) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.warn("AdSense push error:", err);
      }
    }
  }, [clientId]);

  // If no AdSense publisher ID is provided yet, show a clean subtle placeholder in dev/preview
  if (!clientId) {
    return (
      <div
        className={`my-6 flex items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50/50 p-4 text-xs text-slate-400 ${className}`}
      >
        <span>Advertisement Area (Set NEXT_PUBLIC_ADSENSE_CLIENT_ID to activate)</span>
      </div>
    );
  }

  return (
    <div className={`my-6 flex justify-center overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
    </div>
  );
}
