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
          ? "/logo/digiphile-logo-rectangle-inverse.svg"
          : "/logo/digiphile-logo-rectangle-regular.svg"
      }
      alt="Digiphile Logo"
      className={className}
      width={width}
      height={height}
    />
  ) : null;
}
