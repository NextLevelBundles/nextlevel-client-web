"use client";

import { BundleImageDeck } from "../collections/collection-image-deck";
import MediaData from "@/app/(shared)/types/media";

interface HeroImageProps {
  images: MediaData[];
  title: string;
}

export function HeroImage({ images, title }: HeroImageProps) {
  return (
    <BundleImageDeck
      images={images}
      title={title}
      className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110 group-hover:saturate-[1.1]"
    />
  );
}