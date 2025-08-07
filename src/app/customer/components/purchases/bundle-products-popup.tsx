"use client";

import { useState } from "react";
import { Button } from "@/app/(shared)/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/(shared)/components/ui/dialog";
import { CartItem } from "@/lib/api/types/cart";
import { Badge } from "@/app/(shared)/components/ui/badge";
import { Card, CardContent } from "@/app/(shared)/components/ui/card";
import { EyeIcon, DamIcon as SteamIcon, ExternalLinkIcon } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface BundleProductsPopupProps {
  purchase: CartItem;
}

export function BundleProductsPopup({ purchase }: BundleProductsPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <EyeIcon className="h-4 w-4" />
          View Items
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {purchase.snapshotImageUrl && (
                <Image
                  src={purchase.snapshotImageUrl}
                  alt={purchase.snapshotTitle || "Bundle image"}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded object-cover"
                />
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                {purchase.snapshotProducts.length}{" "}
                {purchase.snapshotProducts.length === 1 ? "Game" : "Games"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {purchase.snapshotPlatform}
              </span>
            </div>
            <div className="text-right">
              <p className="font-semibold">${purchase.price.toFixed(2)}</p>
              {purchase.snapshotTierTitle && (
                <p className="text-xs text-muted-foreground">
                  {purchase.snapshotTierTitle}
                </p>
              )}
            </div>
          </div>

          {purchase.isDonationTierSelected && (
            <div className="mt-4 rounded-lg bg-green-50 dark:bg-green-900/20 p-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Charity Contribution
              </p>
              <p className="text-xs text-green-600 dark:text-green-300">
                Charity Tier: ${((purchase.donationTierAmount || 0) - (purchase.snapshotTierPrice || 0)).toFixed(2)} extra went to charity
              </p>
            </div>
          )}

          <div className="grid gap-3">
            {purchase.snapshotProducts.map((product, index) => (
              <motion.div
                key={product.productId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Image
                          src={product.coverImageUrl}
                          alt={product.title}
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded object-cover"
                        />
                        {product.steamGameInfo && (
                          <div className="absolute -bottom-1 -right-1 rounded-full bg-blue-600 p-1">
                            <SteamIcon className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{product.title}</h4>
                        {product.steamGameInfo && (
                          <div className="mt-1 space-y-1">
                            {product.steamGameInfo.steamAppId && (
                              <p className="text-xs text-muted-foreground">
                                Steam App ID: {product.steamGameInfo.steamAppId}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      {product.steamGameInfo?.steamAppId && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() =>
                            window.open(
                              `https://store.steampowered.com/app/${product.steamGameInfo!.steamAppId}`,
                              "_blank"
                            )
                          }
                        >
                          <SteamIcon className="h-4 w-4" />
                          Steam
                          <ExternalLinkIcon className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
