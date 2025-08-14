"use client";

import { Badge } from "@/app/(shared)/components/ui/badge";
import { Button } from "@/app/(shared)/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/(shared)/components/ui/dialog";
import { ScrollArea } from "@/app/(shared)/components/ui/scroll-area";
import { CartItem } from "@/lib/api/types/cart";
import { ExternalLink, Heart, BookOpen, Gamepad2, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface CartItemDetailsProps {
  item: CartItem;
}

export function CartItemDetails({ item }: CartItemDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors"
        >
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image
              width={150}
              height={150}
              src={item.snapshotImageUrl ?? ""}
              alt={item.snapshotTitle ?? "Cart item image"}
              className="w-8 h-8 rounded object-cover"
            />
            {item.snapshotTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{item.snapshotTierTitle}</Badge>
            <Badge 
              variant="outline" 
              className={item.bundleType === 1 
                ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-300" 
                : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-300"
              }
            >
              {item.bundleType === 1 ? (
                <><BookOpen className="h-3 w-3 mr-1" /> Book Bundle</>
              ) : (
                <><Gamepad2 className="h-3 w-3 mr-1" /> Game Bundle</>
              )}
            </Badge>
            {item.isDonationTierSelected && (
              <Badge variant="destructive" className="bg-rose-500">
                Charity Tier
              </Badge>
            )}
            <span className="text-sm text-muted-foreground ml-auto">
              ${(item.isDonationTierSelected && item.donationTierAmount ? item.donationTierAmount : item.price)?.toFixed(2)}
            </span>
          </div>
          
          {item.isDonationTierSelected && item.donationTierAmount && item.snapshotTierPrice && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-800">
              <p className="text-sm text-rose-700 dark:text-rose-300">
                <Heart className="inline h-4 w-4 mr-1" />
                Charity Tier: ${(item.donationTierAmount - item.snapshotTierPrice).toFixed(2)} extra goes directly to charity!
              </p>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-3">
              Included {item.bundleType === 1 ? "Books" : "Games"} ({item.snapshotProducts.length})
            </h4>
            <ScrollArea className="h-96">
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
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{product.title}</h5>
                      {product.productType === 1 && product.bookInfo ? (
                        <div className="space-y-1 mt-1">
                          {product.bookInfo.author && (
                            <div className="text-xs text-muted-foreground">
                              by {product.bookInfo.author}
                            </div>
                          )}
                          {product.bookInfo.formats && product.bookInfo.formats.length > 0 && (
                            <div className="flex gap-1">
                              {product.bookInfo.formats.map((format) => (
                                <span key={format} className="inline-flex items-center gap-0.5 text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded">
                                  <FileText className="h-3 w-3" />
                                  {format}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : product.steamGameInfo ? (
                        <div className="text-xs text-muted-foreground mt-1">
                          Steam Package: {product.steamGameInfo.packageId}
                        </div>
                      ) : null}
                    </div>
                    {product.productType !== 1 && product.steamGameInfo && (
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
