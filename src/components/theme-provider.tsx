"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
// import { type ThemeProviderProps } from 'next-themes/dist/types';
import { useEffect } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ThemeProvider({ children, ...props }: any) {
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until client-side mount
  if (!mounted) {
    return null;
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
