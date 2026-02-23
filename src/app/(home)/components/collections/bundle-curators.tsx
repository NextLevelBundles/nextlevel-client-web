"use client";

import { Curator, CuratorType } from "@/app/(shared)/types/bundle";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/shared/components/ui/avatar";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { User, Video } from "lucide-react";
import { useState } from "react";

interface BundleCuratorsProps {
  curators: Curator[];
  curatorStatement?: string | null;
  curatorVideoLink?: string | null;
}

export function BundleCurators({
  curators,
  curatorStatement,
  curatorVideoLink,
}: BundleCuratorsProps) {
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);

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
            <div
              key={curator.id}
              className="flex items-center gap-2"
            >
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
    <Card className="p-6 my-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="space-y-4">
        {/* Curator Info and Video Button */}
        <div className="flex flex-wrap items-center justify-between gap-4">
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

          {/* Curator Video Button */}
          {curatorVideoLink && (
            <Button
              onClick={() => setVideoDialogOpen(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Video className="h-4 w-4" />
              <span>Watch Curator Video</span>
            </Button>
          )}
        </div>

        {/* Curator Quote - directly below curators */}
        {quote && (
          <p className="text-sm italic text-muted-foreground -mt-2">
            &ldquo;{quote}&rdquo;
          </p>
        )}

        {/* Curator Statement - after separator */}
        {curatorStatement && (
          <div className="pt-3 border-t border-primary/20">
            <p className="text-base italic text-foreground/90 leading-relaxed">
              &ldquo;{curatorStatement}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Video Dialog */}
      {curatorVideoLink && (
        <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
          <DialogContent className="max-w-4xl p-0">
            <DialogHeader className="sr-only">
              <DialogTitle>Curator Video</DialogTitle>
            </DialogHeader>
            <div className="aspect-video w-full">
              <iframe
                src={curatorVideoLink}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
