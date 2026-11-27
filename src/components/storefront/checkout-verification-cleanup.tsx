"use client";

import { useEffect } from "react";

export function CheckoutVerificationCleanup({ storeSlug }: { storeSlug: string | null }) {
  useEffect(() => {
    if (!storeSlug) return;
    try { window.localStorage.removeItem(`vendora-cart:${storeSlug}`); } catch { /* Storage may be unavailable. */ }
  }, [storeSlug]);
  return null;
}
