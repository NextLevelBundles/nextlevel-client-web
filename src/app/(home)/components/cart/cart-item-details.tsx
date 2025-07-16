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
import { CartItem } from "@/lib/client-api";
import { ExternalLink } from "lucide-react";
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
            <Badge variant="outline">{item.snapshotPlatform}</Badge>
            <span className="text-sm text-muted-foreground ml-auto">
              ${item.price?.toFixed(2)}
            </span>
          </div>

          <div>
            <h4 className="font-semibold mb-3">
              Included Games ({item.snapshotProducts.length})
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
                      {product.steamGameInfo && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Steam Package: {product.steamGameInfo.packageId}
                        </div>
                      )}
                    </div>
                    <Link
                      href={`https://store.steampowered.com/app/${product.steamGameInfo?.steamAppId ?? ""}`}
                      target="_blank"
                    >
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
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
