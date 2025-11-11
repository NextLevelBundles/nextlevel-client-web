"use client";

import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import Image from "next/image";

interface ArtworkDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  artworkSrc: string;
  title: string;
  description?: string;
}

export function ArtworkDetailModal({
  isOpen,
  onClose,
  artworkSrc,
  title,
  description,
}: ArtworkDetailModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl p-0 gap-0 overflow-hidden">
        <div className="grid md:grid-cols-[400px_1fr] max-h-[90vh]">
          {/* Left side - Artwork (2:3 aspect ratio) */}
          <div className="relative bg-muted">
            <div className="relative w-full" style={{ aspectRatio: "2/3" }}>
              <Image
                src={artworkSrc}
                alt={title}
                fill
                className="object-contain"
                sizes="400px"
                priority
              />
            </div>
          </div>

          {/* Right side - Details */}
          <div className="flex flex-col p-6 overflow-y-auto">
            {/* Content */}
            <div className="space-y-6 flex-1">
              <div>
                <h2 className="text-3xl font-bold mb-2">{title}</h2>
                <p className="text-sm text-muted-foreground">
                  Exclusive Charity Collection Artwork
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">
                  About This Artwork
                </h3>
                <div className="space-y-3 text-muted-foreground leading-relaxed">
                  <p>
                    We were thrilled to commission Danilo Laynes to create the
                    artwork for our inaugural collection.
                  </p>
                  <p>
                    He is the creator of the Maldito poster, illustrator for
                    Magic: The Gathering, and storyboard & illustration lead for
                    The Hawkeyes: The Story of Clint Barton & Kate Bishop from
                    Marvel Entertainment.
                  </p>
                  <p>If you like what you see, please follow Danilo:</p>
                  <div className="pl-4 space-y-1">
                    <div>@danilo.laynes</div>
                    <a
                      href="https://www.instagram.com/danilo.laynes/reels/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline block"
                    >
                      https://www.instagram.com/danilo.laynes/reels/
                    </a>
                  </div>
                  <p>And check out his incredible work here:</p>
                  <div className="pl-4 space-y-1">
                    <a
                      href="https://malditoposter.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline block"
                    >
                      https://malditoposter.com/
                    </a>
                    <a
                      href="https://danilolaynes.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline block"
                    >
                      https://danilolaynes.com/
                    </a>
                  </div>
                </div>
              </div>

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
                        Exclusive to Charity Tier
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
                        address 2 weeks after the promotion.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div>
                        <h4 className="font-semibold text-rose-700 dark:text-rose-300 mb-1">
                          Supporting Charity
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          This exclusive artwork is included when you add the
                          Charity Tier to your purchase. 100% of the charity
                          tier contribution goes directly to support our
                          featured charitable cause.
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
