"use client";

import { useEffect } from "react";
import { captureLinkIdFromUrl } from "@/app/(shared)/lib/trackdesk";

/**
 * Client component to capture linkId query parameter from URL
 * and store it in localStorage for tracking
 */
export function LinkIdCapture() {
  useEffect(() => {
    captureLinkIdFromUrl();
  }, []);

  return null;
}