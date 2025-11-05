"use client";

import { Badge } from "@/app/(shared)/components/ui/badge";
import { Button } from "@/app/(shared)/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/(shared)/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/(shared)/components/ui/tabs";
import { ScrollArea } from "@/app/(shared)/components/ui/scroll-area";
import { CartItem } from "@/lib/api/types/cart";
import { isBookBundle } from "@/app/(shared)/utils/cart";
import {
  ExternalLink,
  Heart,
  BookOpen,
  Gamepad2,
  FileText,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CartItemModalProps {
  item: CartItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CartItemModal({ item, isOpen, onClose }: CartItemModalProps) {
  if (!item) return null;

  // Calculate revenue distribution
  let publisherAmount = item.baseAmount * 0.75;
  let platformAmount = item.baseAmount * 0.2;
  let charityAmount = item.baseAmount * 0.05;
  charityAmount += item.charityAmount;
  publisherAmount += item.tipAmount;
  const developerSupportAmount = item.upsellAmount;
  const totalAmount = item.totalAmount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Image
              width={150}
              height={150}
              src={item.snapshotImageUrl ?? ""}
              alt={item.snapshotTitle ?? "Cart item image"}
              className="w-8 h-8 rounded object-cover"
            />
            <div className="flex items-center gap-2 flex-1">
              <span>{item.snapshotTitle}</span>
              <Badge
                variant="outline"
                className={
                  isBookBundle(item)
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-300"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-300"
                }
              >
                {isBookBundle(item) ? (
                  <>
                    <BookOpen className="h-3 w-3 mr-1" /> Book Bundle
                  </>
                ) : (
                  <>
                    <Gamepad2 className="h-3 w-3 mr-1" /> Game Bundle
                  </>
                )}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details" className="gap-2 cursor-pointer">
              <BookOpen className="h-4 w-4" />
              What's Included
            </TabsTrigger>
            <TabsTrigger value="revenue" className="gap-2 cursor-pointer">
              <Heart className="h-4 w-4" />
              Payment Breakdown
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="mt-4">
            <div>
              <h4 className="font-semibold mb-3">
                {item.snapshotProducts.length}{" "}
                {isBookBundle(item)
                  ? item.snapshotProducts.length === 1
                    ? "Book"
                    : "Books"
                  : item.snapshotProducts.length === 1
                    ? "Game"
                    : "Games"}{" "}
                Included
              </h4>
              <ScrollArea className="h-[500px] pr-4">
                <div className="grid gap-3">
                  {item.snapshotProducts.map((product) => (
                    <div
                      key={product.productId}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                    >
                      <Image
                        width={150}
                        height={150}
                        src={product.coverImageUrl}
                        alt={product.title}
                        className="w-12 object-contain rounded aspect-[2/3]"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{product.title}</h5>
                        {product.bookInfo ? (
                          <div className="space-y-1 mt-1">
                            {product.bookInfo.metadata?.author && (
                              <div className="text-xs text-muted-foreground">
                                by {product.bookInfo.metadata.author}
                              </div>
                            )}
                            {product.bookInfo.metadata?.availableFormats &&
                              product.bookInfo.metadata.availableFormats
                                .length > 0 && (
                                <div className="flex gap-1">
                                  {product.bookInfo.metadata.availableFormats.map(
                                    (format) => (
                                      <span
                                        key={format}
                                        className="inline-flex items-center gap-0.5 text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded"
                                      >
                                        <FileText className="h-3 w-3" />
                                        {format}
                                      </span>
                                    )
                                  )}
                                </div>
                              )}
                          </div>
                        ) : null}
                      </div>
                      {!product.bookInfo && product.steamGameInfo && (
                        <Link
                          href={`https://store.steampowered.com/app/${product.steamGameInfo?.steamAppId ?? ""}`}
                          target="_blank"
                        >
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Revenue Summary Tab */}
          <TabsContent value="revenue" className="mt-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {/* Distribution Bar */}
                <div className="relative h-8 rounded-lg overflow-hidden flex bg-gray-200 dark:bg-gray-700">
                  <div
                    className="bg-yellow-400 dark:bg-yellow-600 transition-all"
                    style={{
                      width:
                        totalAmount > 0
                          ? `${Math.max(0, (publisherAmount / totalAmount) * 100)}%`
                          : "0%",
                    }}
                  />
                  <div
                    className="bg-blue-400 dark:bg-blue-600 transition-all"
                    style={{
                      width:
                        totalAmount > 0
                          ? `${Math.max(0, (platformAmount / totalAmount) * 100)}%`
                          : "0%",
                    }}
                  />
                  <div
                    className="bg-rose-400 dark:bg-rose-600 transition-all"
                    style={{
                      width:
                        totalAmount > 0
                          ? `${Math.max(0, (charityAmount / totalAmount) * 100)}%`
                          : "0%",
                    }}
                  />
                  {developerSupportAmount > 0 && (
                    <div
                      className="bg-purple-400 dark:bg-purple-600 transition-all"
                      style={{
                        width:
                          totalAmount > 0
                            ? `${Math.max(0, (developerSupportAmount / totalAmount) * 100)}%`
                            : "0%",
                      }}
                    />
                  )}
                </div>

                {/* Distribution Labels */}
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-yellow-400 dark:bg-yellow-600" />
                      <span className="text-sm font-medium">Publishers</span>
                    </div>
                    <span className="text-sm font-bold">
                      ${publisherAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-blue-400 dark:bg-blue-600" />
                      <span className="text-sm font-medium">Platform</span>
                    </div>
                    <span className="text-sm font-bold">
                      ${platformAmount.toFixed(2)}
                    </span>
                  </div>

                  {charityAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-rose-400 dark:bg-rose-600" />
                        <span className="text-sm font-medium">Charity</span>
                      </div>
                      <span className="text-sm font-bold">
                        ${charityAmount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {developerSupportAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-purple-400 dark:bg-purple-600" />
                        <span className="text-sm font-medium">Extras</span>
                      </div>
                      <span className="text-sm font-bold">
                        ${developerSupportAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tip Information - Prominent Section */}
                {item.tipAmount > 0 && (
                  <div className="mt-6 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      Your ${item.tipAmount.toFixed(2)} tip for Publishers goes
                      100% to Publishers
                    </p>
                  </div>
                )}

                {/* Breakdown details */}
                <div className="mt-6 pt-4 border-t space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Bundle Tier</span>
                    <span>${item.baseAmount.toFixed(2)}</span>
                  </div>
                  {item.charityAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Charity Tier</span>
                      <span>${item.charityAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {item.tipAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Tip for Publishers</span>
                      <span>${item.tipAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {item.upsellAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Extra Items</span>
                      <span>${item.upsellAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Total Amount - Prominent at bottom */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">Total Amount</h4>
                    <p className="text-2xl font-bold">
                      ${totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
