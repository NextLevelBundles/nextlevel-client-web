"use client";

import { Fragment } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Calendar,
  User,
  Hash,
  FileText,
} from "lucide-react";
import Image from "next/image";
import { Bundle, Product } from "@/app/(shared)/types/bundle";

function decodeHtmlEntities(text: string): string {
  const doc = new DOMParser().parseFromString(text, "text/html");
  return doc.body.textContent ?? text;
}

interface BookDetailDrawerProps {
  bundle: Bundle;
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToBook: (product: Product) => void;
  unlockedProducts: Product[];
}

export function BookDetailDrawer({
  bundle,
  product,
  isOpen,
  onClose,
  onNavigateToBook,
  unlockedProducts,
}: BookDetailDrawerProps) {
  if (!product) return null;

  const currentIndex = unlockedProducts.findIndex((p) => p.id === product.id);
  const hasNext = currentIndex < unlockedProducts.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNext = () => {
    if (hasNext) {
      onNavigateToBook(unlockedProducts[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (hasPrev) {
      onNavigateToBook(unlockedProducts[currentIndex - 1]);
    }
  };

  const metadata = product.ebookMetadata;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {product.title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrev}
                disabled={!hasPrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {unlockedProducts.length}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                disabled={!hasNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* Book Cover and Basic Info */}
            <div className="grid md:grid-cols-[300px_1fr] gap-6">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                <Image
                  fill
                  src={product.coverImage?.url || "/placeholder.jpg"}
                  alt={product.title}
                  className="object-cover"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{product.title}</h2>
                  {metadata?.author && (
                    <p className="text-lg text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      by {metadata.author}
                    </p>
                  )}
                </div>

                {/* Book Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  {metadata?.publisher && (
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Publisher:</span>
                      <span>{metadata.publisher}</span>
                    </div>
                  )}
                  {metadata?.publicationDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Published:</span>
                      <span>
                        {new Date(metadata.publicationDate).getFullYear()}
                      </span>
                    </div>
                  )}
                  {metadata?.pageCount && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Pages:</span>
                      <span>{metadata.pageCount}</span>
                    </div>
                  )}
                  {metadata?.isbn && (
                    <div className="flex items-center gap-2 text-sm">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">ISBN:</span>
                      <span>{metadata.isbn}</span>
                    </div>
                  )}
                </div>

                {/* Available Formats */}
                {metadata?.availableFormats &&
                  metadata.availableFormats.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">
                        Available Formats
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {metadata.availableFormats.map((format) => (
                          <Badge
                            key={format}
                            variant="secondary"
                          >
                            {format}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Retail Price */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Retail Price
                    </span>
                    <span className="text-lg font-semibold line-through text-muted-foreground">
                      ${product.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">About this book</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {decodeHtmlEntities(product.description)}
                </p>
              </div>

              {product.curatorComment && (
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Curator's Corner
                  </h4>
                  <p className="text-sm">{product.curatorComment}</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
