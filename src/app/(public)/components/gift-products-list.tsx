"use client";

import { useState } from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DamIcon as SteamIcon,
  ExternalLinkIcon,
  ChevronDown,
  ChevronUp,
  Package,
  BookIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { SnapshotProduct } from "@/lib/api/types/gift";

interface GiftProductsListProps {
  products: SnapshotProduct[];
  platform?: string;
}

export function GiftProductsList({
  products,
  platform,
}: GiftProductsListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (products.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Accordion Header */}
      <Card className="overflow-hidden">
        <Button
          variant="ghost"
          className="w-full p-4 hover:bg-muted/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-semibold">
                  What&apos;s included
                </h3>
                {platform == "Ebook" ? (
                  <p className="text-sm text-muted-foreground">
                    {products.length} {products.length === 1 ? "book" : "books"}{" "}
                    in this collection
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {products.length} Steam{" "}
                    {products.length === 1 ? "game" : "games"} in this
                    collection
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {platform && (
                <Badge variant="outline" className="gap-1">
                  {platform == "Ebook" ? (
                    <BookIcon className="h-3 w-3" />
                  ) : (
                    <SteamIcon className="h-3 w-3" />
                  )}
                  {platform}
                </Badge>
              )}
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </Button>
      </Card>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid gap-3 pt-2">
              {products.map((product, index) => (
                <motion.div
                  key={product.productId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
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
                            className="rounded shadow object-contain aspect-[2/3]"
                          />
                          {product.steamGameInfo && (
                            <div className="absolute -bottom-1 -right-1 rounded-full bg-blue-600 p-1">
                              <SteamIcon className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{product.title}</h4>
                          {product.steamGameInfo?.steamAppId && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Steam App ID: {product.steamGameInfo.steamAppId}
                            </p>
                          )}
                        </div>
                        {product.steamGameInfo?.steamAppId && (
                          <a
                            href={`https://store.steampowered.com/app/${product.steamGameInfo.steamAppId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            <ExternalLinkIcon className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
