"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useState, useEffect } from "react";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function Logo({
  width = 160,
  height = 0,
  className = undefined,
}: LogoProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? (
    <Image
      src={
        resolvedTheme === "dark"
          ? "/logo/digiphile-wordmark-horizontal-light.png"
          : "/logo/digiphile-wordmark-horizontal-dark.png"
      }
      alt="Digiphile Logo"
      className={className}
      width={width}
      height={height}
    />
  ) : null;
}
