"use client";

import { Curator, CuratorType } from "@/app/(shared)/types/bundle";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/shared/components/ui/avatar";
import { Card } from "@/shared/components/ui/card";
import { User } from "lucide-react";

interface BundleCuratorsProps {
  curators: Curator[];
}

export function BundleCurators({ curators }: BundleCuratorsProps) {
  if (!curators || curators.length === 0) return null;

  const leadCurators = curators.filter((c) => c.type === CuratorType.Lead);
  const guestCurators = curators.filter((c) => c.type === CuratorType.Guest);

  // Get the first quote from any curator (prioritize lead, then guest)
  const quote = leadCurators[0]?.quote || guestCurators[0]?.quote;

  const renderCuratorList = (curatorList: Curator[], label: string) => {
    if (curatorList.length === 0) return null;

    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          {label}:
        </span>
        <div className="flex items-center gap-3">
          {curatorList.map((curator) => (
            <div key={curator.id} className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border-2 border-primary/20">
                {curator.customerPictureUrl ? (
                  <AvatarImage
                    src={curator.customerPictureUrl}
                    alt={curator.customerName}
                  />
                ) : null}
                <AvatarFallback className="bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-semibold">
                {curator.customerName}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="p-4 my-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-4">
          {renderCuratorList(leadCurators, "Curated by")}
          {leadCurators.length > 0 && guestCurators.length > 0 && (
            <span className="text-muted-foreground">|</span>
          )}
          {guestCurators.length > 0 &&
            renderCuratorList(
              guestCurators,
              guestCurators.length === 1 ? "Guest Curator" : "Guest Curators",
            )}
        </div>

        {quote && (
          <div className="pt-2 border-t">
            <p className="text-sm italic text-muted-foreground">
              &ldquo;{quote}&rdquo;
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
