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
          "relative w-full h-full flex items-center justify-center overflow-hidden",
          containerClassName
        )}
      >
        <div className="relative w-full h-full group/single">
          <Image
            fill
            sizes="400px"
            quality={90}
            src={displayImages[0].url}
            alt={title}
            className={cn(
              "object-cover transition-transform duration-300 group-hover/single:scale-105",
              className
            )}
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

          // Card dimensions as percentage of container
          const cardWidthPercent = 38;
          const cardHeightPercent = 95;

          // Distribute cards evenly across container width using percentages
          const maxLeft = 100 - cardWidthPercent;
          const step = totalImages > 1 ? maxLeft / (totalImages - 1) : 0;
          const baseLeft = index * step;

          // Z-index: maintain stacking order left to right
          const baseZIndex = index * 10;
          const zIndex = isHovered ? baseZIndex + 5 : baseZIndex;

          // Hover effects — small percentage shift keeps it fluid
          const hoverLeftOffset = isHovered ? -3 : 0;
          const hoverTranslateY = isHovered ? -15 : 0;
          const hoverRotation = isHovered ? -3 : 0;
          const hoverScale = isHovered ? 1.03 : 1;

          return (
            <div
              key={image.id}
              className="absolute"
              style={{
                left: `${baseLeft + hoverLeftOffset}%`,
                top: "50%",
                width: `${cardWidthPercent}%`,
                height: `${cardHeightPercent}%`,
                transform: `
                  translateY(-50%)
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
                  className="absolute inset-0 rounded-lg"
                  style={{
                    boxShadow: isHovered
                      ? "0 15px 30px -8px rgba(0, 0, 0, 0.4), 0 8px 16px -4px rgba(0, 0, 0, 0.25)"
                      : "0 10px 25px -8px rgba(0, 0, 0, 0.3), 0 4px 10px -4px rgba(0, 0, 0, 0.15)",
                    transition: "box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />

                {/* Image container with 600x900 aspect ratio (2:3) */}
                <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-800">
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
