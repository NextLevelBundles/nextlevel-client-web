import Image from "next/image";
import MediaData from "@/app/(shared)/types/media";
import { cn } from "@/shared/utils/tailwind";

interface BundleStaticDeckProps {
  images: MediaData[];
  title: string;
  className?: string;
  containerClassName?: string;
}

export function BundleStaticDeck({
  images,
  title,
  className,
  containerClassName,
}: BundleStaticDeckProps) {
  // Display all images
  const displayImages = images;

  if (displayImages.length === 0) {
    return (
      <div
        className={cn(
          "relative w-full h-full bg-gray-900",
          containerClassName
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gray-600">No image available</span>
        </div>
      </div>
    );
  }

  // If only one image, display it full width
  if (displayImages.length === 1) {
    return (
      <div className={cn("relative w-full h-full", containerClassName)}>
        <div className="relative w-full h-full bg-gray-900">
          <Image
            fill
            sizes="100vw"
            quality={90}
            src={displayImages[0].url}
            alt={title}
            className={cn("object-cover", className)}
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full", containerClassName)}>
      <div className="flex h-full">
        {displayImages.map((image, index) => {
          // Calculate width based on number of images to fit screen
          const imageWidth = `${100 / displayImages.length}%`;

          return (
            <div
              key={image.id}
              className="relative h-full"
              style={{
                width: imageWidth,
              }}
            >
              {/* Image container - no gaps */}
              <div className="relative w-full h-full bg-gray-900">
                <Image
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  quality={90}
                  src={image.url}
                  alt={`${title} - Image ${index + 1}`}
                  className={cn(
                    "object-cover",
                    className
                  )}
                  priority={index <= 2}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}