"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/shared/utils/tailwind";
import MediaData from "@/app/(shared)/types/media";

interface GameImageDeckProps {
  coverImage?: MediaData;
  screenshotUrlsJson?: string | null;
  title: string;
  className?: string;
  containerClassName?: string;
}

export function GameImageDeck({
  coverImage,
  screenshotUrlsJson,
  title,
  className,
  containerClassName,
}: GameImageDeckProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Prioritize database cover image, then fall back to Steam screenshots
  let displayImages: string[] = [];

  if (coverImage?.url) {
    // Use database cover image as primary
    displayImages = [coverImage.url];
  } else {
    // Fall back to Steam screenshots
    const screenshots = screenshotUrlsJson
      ? (() => {
          try {
            return JSON.parse(screenshotUrlsJson);
          } catch {
            return [];
          }
        })()
      : [];
    displayImages = screenshots.slice(0, 5);
  }

  if (displayImages.length === 0) {
    return (
      <div
        className={cn(
          "relative w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-md",
          containerClassName
        )}
      >
        <Image
          src="/images/hero-background.jpg"
          alt={title}
          fill
          sizes="200px"
          className={cn("object-cover rounded-md", className)}
        />
      </div>
    );
  }

  // If only one image, display it normally
  if (displayImages.length === 1) {
    return (
      <div
        className={cn(
          "relative w-full aspect-square",
          containerClassName
        )}
      >
        <Image
          src={displayImages[0]}
          alt={title}
          fill
          sizes="200px"
          className={cn("object-cover rounded-md", className)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full aspect-square flex items-center justify-center",
        containerClassName
      )}
    >
      <div className="relative w-full h-full">
        {displayImages.map((imageUrl: string, index: number) => {
          const isHovered = hoveredIndex === index;
          const totalImages = displayImages.length;

          // Create a spread effect for multiple screenshots
          const spreadFactor = 40; // Smaller spread for game cards
          const baseTranslateX = (index - (totalImages - 1) / 2) * spreadFactor;

          // No rotation by default, only on hover
          const baseRotation = 0;

          // Z-index: maintain stacking order
          const baseZIndex = index * 10;
          const zIndex = isHovered ? baseZIndex + 5 : baseZIndex;

          // Calculate hover effects
          const hoverRotation = isHovered ? -2 : baseRotation;
          const hoverTranslateX = isHovered
            ? baseTranslateX - 10
            : baseTranslateX;
          const hoverTranslateY = isHovered ? -8 : 0;
          const hoverScale = isHovered ? 1.02 : 1;

          // Card dimensions
          const cardWidthPercent = 50; // Width as percentage of container
          const cardHeightPercent = 90; // Height as percentage of container

          return (
            <div
              key={index}
              className="absolute"
              style={{
                left: "50%",
                top: "50%",
                width: `${cardWidthPercent}%`,
                height: `${cardHeightPercent}%`,
                transform: `
                  translate(-50%, -50%)
                  translateX(${hoverTranslateX}px)
                  translateY(${hoverTranslateY}px)
                  rotate(${hoverRotation}deg)
                  scale(${hoverScale})
                `,
                zIndex,
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                transformOrigin: "center bottom",
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Card container */}
              <div className="relative w-full h-full">
                {/* Shadow effect */}
                <div
                  className="absolute inset-0 rounded-md"
                  style={{
                    boxShadow: isHovered
                      ? "0 8px 20px -4px rgba(0, 0, 0, 0.3), 0 4px 8px -2px rgba(0, 0, 0, 0.2)"
                      : "0 4px 12px -4px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
                    transition: "box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />

                {/* Image container */}
                <div className="relative w-full h-full rounded-md overflow-hidden bg-gray-800">
                  <Image
                    src={imageUrl}
                    alt={`${title} - Screenshot ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100px, 150px"
                    className={cn(
                      "object-cover",
                      isHovered && "brightness-105 saturate-[1.02]",
                      className
                    )}
                  />

                  {/* Subtle overlay for depth */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: isHovered
                        ? "linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.1) 100%)"
                        : "linear-gradient(to bottom, transparent 80%, rgba(0,0,0,0.05) 100%)",
                      transition: "all 0.25s ease",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}