"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { BundleCard } from "@/home/components/bundles/bundle-card";
// import { bundles as allBundles, Bundle } from "@/home/data/bundles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowDownAZ,
  ArrowUpAZ,
  X,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Bundle } from "@/app/(shared)/types/bundle";

const ITEMS_PER_PAGE = 9;

const filters = [
  { label: "All", value: "all" },
  { label: "Featured", value: "featured" },
  { label: "Early Access", value: "early_acces" },
  { label: "Limited Keys", value: "limited_keys" },
  { label: "Best Value", value: "best_value" },
];

const sortOptions = [
  { label: "Ending Soon", value: "ending-soon", icon: Clock },
  { label: "Price: Low to High", value: "price-asc", icon: ArrowDownAZ },
  { label: "Price: High to Low", value: "price-desc", icon: ArrowUpAZ },
];

interface BundlesGridProps {
  bundles: Bundle[];
}

export function BundlesGrid({ bundles }: BundlesGridProps) {
  const [currentFilter, setCurrentFilter] = useState("all");
  const [currentSort, setCurrentSort] = useState("ending-soon");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredBundles = bundles
    .filter((bundle) => {
      if (currentFilter === "all") return true;
      if (currentFilter === "featured") return bundle.isFeatured;
      if (currentFilter === "early_acces") return bundle.isEarlyAccess;
      if (currentFilter === "limited_keys") return bundle.isLimitedKeys;
      return false;
    })
    .sort((a, b) => {
      switch (currentSort) {
        case "ending-soon":
          return new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime();
        case "price-asc":
          return a.minPrice - b.minPrice;
        case "price-desc":
          return b.minPrice - a.minPrice;
        default:
          return a.minPrice - b.minPrice;
      }
    });

  const totalPages = Math.ceil(filteredBundles.length / ITEMS_PER_PAGE);
  const currentBundles = filteredBundles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <section className="relative py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,130,245,0.15),transparent_70%),radial-gradient(ellipse_at_bottom,rgba(249,113,20,0.1),transparent_70%)] opacity-30 dark:opacity-40" />
      <div className="container relative px-4">
        <div className="mb-12">
          <h1 className="font-orbitron mb-4 text-3xl font-bold tracking-tight md:text-4xl text-foreground">
            Game Bundles
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Browse our collection of premium game bundles. Each bundle is
            carefully curated to bring you the best gaming experience at
            unbeatable prices.
          </p>
        </div>

        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                aria-label={`Filter by ${filter.label}`}
                key={filter.value}
                variant={currentFilter === filter.value ? "default" : "outline"}
                onClick={() => {
                  setCurrentFilter(filter.value);
                  setCurrentPage(1);
                }}
                className="transition-all hover:shadow-md dark:hover:shadow-primary/20"
              >
                {filter.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select
              value={currentSort}
              onValueChange={(value) => {
                setCurrentSort(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {currentFilter !== "all" && (
          <div className="mb-6 flex items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1">
              <span className="flex items-center gap-2">
                {filters.find((f) => f.value === currentFilter)?.label}
                <button
                  onClick={() => setCurrentFilter("all")}
                  className="ml-1 rounded-full hover:bg-secondary/20 p-0.5"
                  aria-label="Remove filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFilter("all")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {currentBundles.map((bundle, index) => (
            <BundleCard key={bundle.id} bundle={bundle} index={index} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
