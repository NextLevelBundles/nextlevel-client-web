"use client";

import { useState } from "react";
import Image from "next/image";
import MediaData from "@/app/(shared)/types/media";
import { cn } from "@/shared/utils/tailwind";

interface BundleImageDeckProps {
  images: MediaData[];
  title: string;
  className?: string;
  containerClassName?: string;
}

export function BundleImageDeck({
  images,
  title,
  className,
  containerClassName,
}: BundleImageDeckProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Take maximum 5 images
  const displayImages = images.slice(0, 5);

  if (displayImages.length === 0) {
    return (
      <div
        className={cn(
          "relative w-full h-full bg-gray-200 dark:bg-gray-800 rounded-2xl",
          containerClassName
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gray-400">No image available</span>
        </div>
      </div>
    );
  }

  // If only one image, display it normally with aspect ratio
  if (displayImages.length === 1) {
    return (
      <div
        className={cn(
          "relative w-full h-full flex items-center justify-center",
          containerClassName
        )}
      >
        <div className="relative w-full h-full">
          <Image
            fill
            sizes="400px"
            quality={90}
            src={displayImages[0].url}
            alt={title}
            className={cn("object-cover rounded", className)}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full h-full flex items-center justify-center",
        containerClassName
      )}
    >
      <div className="relative w-full h-full">
        {displayImages.map((image, index) => {
          const isHovered = hoveredIndex === index;
          const totalImages = displayImages.length;

          // Create a straight stack with cards spread out more horizontally
          // Cards are straight by default, only rotate on hover
          const spreadFactor = 65; // Increased spread for better visibility
          const baseTranslateX = (index - (totalImages - 1) / 2) * spreadFactor;

          // No rotation by default, only on hover
          const baseRotation = 0;

          // Z-index: maintain stacking order left to right
          // Hovered card only gets higher z-index than cards to its left
          const baseZIndex = index * 10;
          const zIndex = isHovered ? baseZIndex + 5 : baseZIndex;

          // Calculate hover effects - subtle lift without breaking visual hierarchy
          const hoverRotation = isHovered ? -3 : baseRotation;
          const hoverTranslateX = isHovered
            ? baseTranslateX - 20
            : baseTranslateX; // Move left when hovered
          const hoverTranslateY = isHovered ? -15 : 0; // Lift up slightly
          const hoverScale = isHovered ? 1.03 : 1; // Subtle scale increase

          // Card dimensions to maintain aspect ratio
          const cardWidthPercent = 38; // Width as percentage of container (narrower for better spread visibility)
          const cardHeightPercent = 95; // Height as percentage of container

          return (
            <div
              key={image.id}
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
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                transformOrigin: "center bottom",
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Card container with aspect ratio */}
              <div className="relative w-full h-full">
                {/* Shadow effect */}
                <div
                  className="absolute inset-0 rounded"
                  style={{
                    boxShadow: isHovered
                      ? "0 15px 30px -8px rgba(0, 0, 0, 0.4), 0 8px 16px -4px rgba(0, 0, 0, 0.25)"
                      : "0 10px 25px -8px rgba(0, 0, 0, 0.3), 0 4px 10px -4px rgba(0, 0, 0, 0.15)",
                    transition: "box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />

                {/* Image container with 600x900 aspect ratio (2:3) */}
                <div className="relative w-full h-full rounded overflow-hidden bg-gray-800">
                  <Image
                    fill
                    sizes="(max-width: 768px) 200px, 300px"
                    quality={90}
                    src={image.url}
                    alt={`${title} - Image ${index + 1}`}
                    className={cn(
                      "object-cover",
                      isHovered && "brightness-105 saturate-[1.05]",
                      className
                    )}
                    style={{
                      objectPosition: "center",
                    }}
                  />

                  {/* Subtle gradient overlay for depth */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: isHovered
                        ? "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.15) 100%)"
                        : "linear-gradient(to bottom, transparent 70%, rgba(0,0,0,0.05) 100%)",
                      transition: "all 0.3s ease",
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
