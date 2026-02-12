"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ImageIcon, StarIcon } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useCuratorProfile } from "@/hooks/queries/useCuratorProfile";

export default function CuratorCollectionsPage() {
  const params = useParams();
  const username = params.username as string;
  const { data: curatorProfile, isLoading } = useCuratorProfile(username);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center border-b px-5 py-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide">
          Collections by {username}
        </h3>
      </div>
      <div className="p-5">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="aspect-[16/10] rounded-lg" />
            ))}
          </div>
        ) : (curatorProfile?.curatedBundles?.length ?? 0) > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {curatorProfile!.curatedBundles.map((bundle) => (
              <Link
                key={bundle.id}
                href={`/collections/${bundle.slug}`}
                className="group"
              >
                <div className="rounded-lg border overflow-hidden bg-card hover:bg-muted/50 transition-colors">
                  <div className="aspect-[16/10] bg-muted/50 relative">
                    {bundle.coverImageUrl ? (
                      <Image
                        src={bundle.coverImageUrl}
                        alt={bundle.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                        {bundle.title}
                      </h4>
                      <Badge
                        variant={bundle.curatorRole === "Lead" ? "default" : "secondary"}
                        className="text-[10px] flex-shrink-0"
                      >
                        {bundle.curatorRole === "Lead" ? "Lead Curator" : "Guest Curator"}
                      </Badge>
                    </div>
                    {bundle.quote && (
                      <p className="text-xs text-muted-foreground italic line-clamp-2">
                        &ldquo;{bundle.quote}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <StarIcon className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No curated collections yet.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
