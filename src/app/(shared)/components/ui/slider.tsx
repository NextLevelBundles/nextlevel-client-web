"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/shared/utils/tailwind";

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  leftTrackClass?: string;
  handleClass?: string;
  backgroundClass?: string;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    { className, leftTrackClass, handleClass, backgroundClass, ...props },
    ref
  ) => (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          "relative h-2 w-full grow overflow-hidden rounded-full",
          backgroundClass || "bg-secondary/20"
        )}
      >
        <SliderPrimitive.Range
          className={cn("absolute h-full", leftTrackClass || "bg-primary")}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          "block h-4 w-4 rounded-sm border border-border shadow-xs transition-colors",
          "bg-white dark:bg-neutral-800",
          "focus-visible:outline-hidden dark:ring-1 dark:ring-white/20 dark:ring-inset focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          handleClass
        )}
      />
    </SliderPrimitive.Root>
  )
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
