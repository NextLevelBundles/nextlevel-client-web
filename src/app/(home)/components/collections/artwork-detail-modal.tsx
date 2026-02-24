"use client";

import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { TierType } from "@/app/(shared)/types/bundle";
import Image from "next/image";

interface ArtworkDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  artworkSrc: string;
  title: string;
  description?: string;
  tierName?: string;
  tierType?: TierType;
}

export function ArtworkDetailModal({
  isOpen,
  onClose,
  artworkSrc,
  title,
  description,
  tierName,
  tierType,
}: ArtworkDetailModalProps) {
  const isCharity = tierType === TierType.Charity;
  const tierLabel = tierName || (isCharity ? "Charity Tier" : "Extra Items");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl p-0 gap-0 overflow-hidden">
        <div className="grid md:grid-cols-[400px_1fr] max-h-[90vh]">
          {/* Left side - Artwork (2:3 aspect ratio) */}
          <div className="relative bg-muted">
            <div className="relative w-full" style={{ aspectRatio: "2/3" }}>
              {artworkSrc ? (
                <Image
                  src={artworkSrc}
                  alt={title}
                  fill
                  className="object-contain"
                  sizes="400px"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  No preview available
                </div>
              )}
            </div>
          </div>

          {/* Right side - Details */}
          <div className="flex flex-col p-6 overflow-y-auto">
            {/* Content */}
            <div className="space-y-6 flex-1">
              <div>
                <h2 className="text-3xl font-bold mb-2">{title}</h2>
              </div>

              {description && (
                <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {description}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="text-muted-foreground min-w-[100px]">
                        Type
                      </div>
                      <div className="font-medium">Digital Artwork</div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-muted-foreground min-w-[100px]">
                        Availability
                      </div>
                      <div className="font-medium">
                        Exclusive to {tierLabel}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-muted-foreground min-w-[100px]">
                        Format
                      </div>
                      <div className="font-medium">
                        Hi-resolution JPEG (5120x2880) - no watermark
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-muted-foreground min-w-[100px]">
                        Delivery
                      </div>
                      <div className="font-medium">
                        Custom artwork will be delivered to your default email
                        address 2 weeks after the promotion ends.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className={isCharity
                    ? "bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4"
                    : "bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4"
                  }>
                    <div className="flex items-start gap-3">
                      <div>
                        <h4 className={isCharity
                          ? "font-semibold text-rose-700 dark:text-rose-300 mb-1"
                          : "font-semibold text-purple-700 dark:text-purple-300 mb-1"
                        }>
                          {isCharity ? "Supporting Charity" : "Bonus Content"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {isCharity
                            ? <>This exclusive content is included when you add the <strong>{tierLabel}</strong> tier to your purchase. 100% of the charity tier contribution goes directly to support our featured charitable cause.</>
                            : <>This exclusive content is included when you add the <strong>{tierLabel}</strong> tier to your purchase.</>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
