"use client";

import { BundleImageDeck } from "../collections/collection-image-deck";
import MediaData from "@/app/(shared)/types/media";
import Image from "next/image";

interface HeroImageProps {
  images: MediaData[];
  title: string;
  seoImage?: MediaData & {
    width?: number;
    height?: number;
  };
}

export function HeroImage({ images, title, seoImage }: HeroImageProps) {
  // Use SEO image if available, otherwise fallback to image deck
  if (seoImage?.url) {
    return (
      <Image
        src={seoImage.url}
        alt={title}
        fill
        className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110 group-hover:saturate-[1.1]"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
      />
    );
  }

  // Fallback to current implementation
  return (
    <BundleImageDeck
      images={images}
      title={title}
      className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110 group-hover:saturate-[1.1]"
    />
  );
}