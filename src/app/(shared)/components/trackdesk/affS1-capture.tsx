"use client";

import { useEffect } from "react";
import { captureAffS1FromUrl } from "@/app/(shared)/lib/trackdesk";

/**
 * Client component to capture affS1 query parameter from URL
 * and store it in localStorage for tracking
 */
export function AffS1Capture() {
  useEffect(() => {
    captureAffS1FromUrl();
  }, []);

  return null;
}
