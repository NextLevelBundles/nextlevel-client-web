"use client";

import { LogOutIcon } from "lucide-react";
import { useAuth } from "@/app/(shared)/providers/auth-provider";
import { useState } from "react";
import { cn } from "@/app/(shared)/utils/tailwind";

interface SignOutButtonProps {
  variant?: "default" | "dropdown";
}

export default function SignOutButton({ variant = "default" }: SignOutButtonProps) {
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const isInteractive = variant === "default";

  const onSignOut = async () => {
    setIsLoading(true);
    // Capture current URL to redirect back after logout (only for public pages)
    const currentPath = window.location.pathname;
    const isProtectedRoute = currentPath.startsWith('/customer') || currentPath.startsWith('/onboarding');

    // Only redirect back to current page if it's a public page
    const redirectUrl = isProtectedRoute ? '/' : currentPath;
    await signOut(redirectUrl);
    // setIsLoading will be cleared when component unmounts
  };

  return (
    <button
      onClick={onSignOut}
      onMouseEnter={() => isInteractive && setIsHovered(true)}
      onMouseLeave={() => isInteractive && setIsHovered(false)}
      type="button"
      disabled={isLoading}
      className={cn(
        "cursor-pointer relative flex items-center gap-2 text-sm font-medium",
        isInteractive ? [
          "px-4 py-2 rounded-lg",
          "transition-all duration-300 ease-out",
          "text-red-600 dark:text-red-400",
          "hover:bg-red-50 dark:hover:bg-red-950/30",
          "hover:text-red-700 dark:hover:text-red-300",
          "hover:shadow-lg hover:shadow-red-500/20 dark:hover:shadow-red-400/20",
          "hover:scale-105 active:scale-95",
          "border border-transparent hover:border-red-200 dark:hover:border-red-800",
          "group"
        ] : [
          "w-full justify-start px-0 py-0",
          "text-red-600 dark:text-red-400",
          "hover:text-red-700 dark:hover:text-red-300",
          "transition-colors"
        ],
        isLoading && "opacity-50 cursor-not-allowed"
      )}
    >
      <LogOutIcon
        className={cn(
          "h-4 w-4",
          isInteractive && "transition-all duration-300",
          isInteractive && isHovered && !isLoading && "rotate-12 scale-110"
        )}
      />
      <span className="relative">
        {isLoading ? "Logging out..." : "Log out"}
        {isInteractive && (
          <span
            className={cn(
              "absolute inset-x-0 -bottom-0.5 h-0.5 bg-red-500 dark:bg-red-400",
              "transition-all duration-300 origin-left",
              isHovered && !isLoading ? "scale-x-100" : "scale-x-0"
            )}
          />
        )}
      </span>

      {/* Hover effect backdrop - only for interactive variant */}
      {isInteractive && (
        <div
          className={cn(
            "absolute inset-0 rounded-lg bg-gradient-to-r from-red-500/10 to-red-600/10",
            "dark:from-red-400/10 dark:to-red-500/10",
            "opacity-0 group-hover:opacity-100",
            "transition-opacity duration-300",
            "-z-10"
          )}
        />
      )}
    </button>
  );
}
