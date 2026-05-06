"use client";

import { useEffect } from "react";

const SITE_ID = "meetzy-landing";

export default function WidgetDemo() {
  useEffect(() => {
    // Guard: don't load twice
    if (document.getElementById("meetzy-widget")) return;

    // Set config BEFORE loading the script
    (window as Window & { MEETZYCONFIG?: { siteId: string } }).MEETZYCONFIG = {
      siteId: SITE_ID,
    };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const script = document.createElement("script");
    script.src = `${appUrl}/widget.js`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up widget on unmount (dev HMR)
      const host = document.getElementById("meetzy-widget");
      if (host) host.remove();
    };
  }, []);

  return null;
}
