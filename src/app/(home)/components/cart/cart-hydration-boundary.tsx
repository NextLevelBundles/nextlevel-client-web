"use client";

import { useEffect, useState } from "react";

interface CartHydrationBoundaryProps {
  children: React.ReactNode;
}

/**
 * This component ensures proper hydration of cart data between server and client.
 * It prevents hydration mismatches by waiting for client-side hydration to complete.
 */
export function CartHydrationBoundary({
  children,
}: CartHydrationBoundaryProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // During SSR and initial client render, show a loading state for cart-dependent UI
  if (!isHydrated) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  return <>{children}</>;
}
