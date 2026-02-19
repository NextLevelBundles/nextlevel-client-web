"use client";

import { Bundle } from "@/app/(shared)/types/bundle";

interface CollectionHeroV3Props {
  bundle: Bundle;
}

export function CollectionHeroV3({ bundle }: CollectionHeroV3Props) {
  return (
    <div className="container max-w-[1560px] relative min-h-[520px] w-full overflow-hidden rounded-3xl bg-gray-900 flex items-center justify-center">
      <p className="text-white/50 text-lg">Hero V3 — {bundle.title}</p>
    </div>
  );
}
