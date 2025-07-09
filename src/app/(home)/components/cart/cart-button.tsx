"use client";

import { Button } from "@/app/(shared)/components/ui/button";
import { useCart } from "@/app/(shared)/contexts/cart-provider";
import { cn } from "@/app/(shared)/utils/tailwind";
import { ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";

interface CartButtonProps {
  onClick?: () => void;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function CartButton({
  onClick,
  className,
  variant = "ghost",
  size = "icon",
}: CartButtonProps) {
  const { getTotalItems } = useCart();
  const [itemCount, setItemCount] = useState(0);

  // Update item count on client side to prevent hydration mismatch
  useEffect(() => {
    setItemCount(getTotalItems());
  }, [getTotalItems]);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={cn(
        "relative hover:bg-primary/10 hover:text-primary transition-colors",
        className
      )}
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-xs font-bold text-white flex items-center justify-center animate-pulse">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
      <span className="sr-only">Shopping cart with {itemCount} items</span>
    </Button>
  );
}
