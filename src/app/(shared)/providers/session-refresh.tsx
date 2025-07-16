/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { getSession, useSession } from "next-auth/react";
import { useEffect } from "react";

export default function SessionRefresh() {
  const { data: session } = useSession();

  useEffect(() => {
    const interval = setInterval(
      () => {
        const expires_at = (session as any)?.expires_at;

        const shouldRefreshToken =
          !expires_at ||
          (expires_at && Date.now() >= expires_at * 1000 - 10 * 60 * 1000); // Refresh if token is expiring in less than 10 minutes

        if (shouldRefreshToken) {
          console.log("Refreshing session...");
          getSession();
        }
      },
      5 * 60 * 1000
    ); // 5 minutes

    return () => clearInterval(interval); // Cleanup on unmount
  });

  return null;
}
