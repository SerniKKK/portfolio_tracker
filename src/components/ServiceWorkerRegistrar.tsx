"use client";

import { useEffect } from "react";

// Registers the service worker in production only. Skipped in dev so local
// caching never masks changes while iterating.
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failures are non-fatal; the app works without the SW.
    });
  }, []);

  return null;
}
