"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export default function WidgetDemo() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Set config before script loads
    (window as Window & { MEETZYCONFIG?: { siteId: string } }).MEETZYCONFIG = {
      siteId: "meetzy-landing",
    };
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <Script
      src={`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/widget.js`}
      strategy="lazyOnload"
    />
  );
}
