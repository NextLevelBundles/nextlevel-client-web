"use client";

import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Trophy,
  Medal,
  Award,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCharityLeaderboard } from "@/hooks/queries/useCharityLeaderboard";
import { cn } from "@/shared/utils/tailwind";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface CharityLeaderboardProps {
  bundleId: string;
}

export function CharityLeaderboard({ bundleId }: CharityLeaderboardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  const { data, isLoading, isError } = useCharityLeaderboard(
    bundleId,
    currentPage,
    pageSize
  );

  const getRankIcon = (index: number) => {
    const rank = (currentPage - 1) * pageSize + index + 1;

    if (rank === 1) {
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    } else if (rank === 2) {
      return <Medal className="h-5 w-5 text-gray-400" />;
    } else if (rank === 3) {
      return <Award className="h-5 w-5 text-amber-600" />;
    }
    return (
      <span className="text-sm font-semibold text-muted-foreground w-5 text-center">
        {rank}
      </span>
    );
  };

  const totalPages = data?.totalPages || 1;

  return (
    <Card className="bg-white dark:bg-card/70 backdrop-blur-xs border border-gray-100 dark:border-border shadow-xs transition-all duration-300 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-100 dark:bg-rose-950/30 rounded-lg">
            <Heart className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold">Charity Leaderboard</h3>
            <p className="text-sm text-muted-foreground">
              Top donors supporting charity
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Failed to load leaderboard</p>
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No donations yet</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {data.items.map((entry, index) => (
                  <div
                    key={`${entry.customerHandle}-${entry.date}`}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg transition-colors",
                      (currentPage - 1) * pageSize + index < 3
                        ? "bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-950/20 dark:to-orange-950/20 border border-rose-100 dark:border-rose-900/30"
                        : "bg-gray-50 dark:bg-gray-800/30"
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-8 flex items-center justify-center">
                        {getRankIcon(index)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          @{entry.customerHandle}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {dayjs(entry.date).fromNow()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="font-bold text-rose-600 dark:text-rose-400">
                        ${entry.donatedAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Simple Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-100 dark:border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <span className="text-sm text-muted-foreground px-2">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
}
