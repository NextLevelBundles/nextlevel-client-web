"use client";

import { useSearchParams } from "next/navigation";
import { Bundle } from "@/app/(shared)/types/bundle";
import { CollectionHeroStage } from "./collection-hero-stage";
import { CollectionHeroV2 } from "./collection-hero-v2";
import { CollectionHeroV3 } from "./collection-hero-v3";
import { CollectionHeroV4 } from "./collection-hero-v4";

interface CollectionHeroSwitcherProps {
  bundle: Bundle;
}

export function CollectionHeroSwitcher({ bundle }: CollectionHeroSwitcherProps) {
  const searchParams = useSearchParams();
  const heroVersion = searchParams.get("heroversion");

  switch (heroVersion) {
    case "2":
      return <CollectionHeroV2 bundle={bundle} />;
    case "3":
      return <CollectionHeroV3 bundle={bundle} />;
    case "4":
      return <CollectionHeroV4 bundle={bundle} />;
    default:
      return <CollectionHeroStage bundle={bundle} />;
  }
}
