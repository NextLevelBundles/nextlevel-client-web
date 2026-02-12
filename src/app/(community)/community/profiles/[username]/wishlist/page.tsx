"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useWishlist } from "@/hooks/queries/useCustomerLists";

function getIgdbCoverUrl(coverImageId: string | null, size = "cover_big") {
  if (!coverImageId) return null;
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${coverImageId}.jpg`;
}

export default function WishlistPage() {
  const { data: wishListDetail, isLoading } = useWishlist();

  if (isLoading) {
    return (
      <div className="grid gap-6">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const items = wishListDetail?.items ?? [];

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Wishlist</h2>
        <span className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "game" : "games"}
        </span>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {items.map((item) => (
            <div key={item.id} className="group relative">
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                {item.coverImageId ? (
                  <Image
                    src={getIgdbCoverUrl(item.coverImageId)!}
                    alt={item.title || ""}
                    width={264}
                    height={352}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center gap-1">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground text-center px-2 truncate w-full">
                      {item.title}
                    </p>
                  </div>
                )}
              </div>
              <p className="text-xs mt-1 truncate text-muted-foreground">
                {item.title}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <ImageIcon className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            No games in your wishlist yet.
          </p>
        </div>
      )}
    </div>
  );
}
