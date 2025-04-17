"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  if (!mounted) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={cycleTheme}
            className="hover:bg-primary/10 hover:text-primary transition-colors"
          >
            {theme === "light" && (
              <Sun className="h-5 w-5 transition-transform hover:scale-110" />
            )}
            {theme === "dark" && (
              <Moon className="h-5 w-5 transition-transform hover:scale-110" />
            )}
            {(theme === "system" || !theme) && (
              <Laptop className="h-5 w-5 transition-transform hover:scale-110" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            Theme: {theme?.charAt(0).toUpperCase()}
            {theme?.slice(1)}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
