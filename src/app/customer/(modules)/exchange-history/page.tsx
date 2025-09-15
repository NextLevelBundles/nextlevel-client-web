"use client";


import React, { useState, useMemo } from "react";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Activity, Search, Calendar, Filter } from "lucide-react";
import { useExchangeHistory, useExchangeSummary } from "@/hooks/queries/use-exchange-history";
import { useIsMobile } from "@/hooks/use-media-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/(shared)/components/ui/card";
import { Badge } from "@/app/(shared)/components/ui/badge";
import { Skeleton } from "@/app/(shared)/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/app/(shared)/components/ui/pagination";
import type { ExchangeTransactionDto } from "@/lib/api/types/exchange-history";

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  loading
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {trend === 'up' && <ArrowUpRight className="h-3 w-3 text-green-500" />}
                {trend === 'down' && <ArrowDownRight className="h-3 w-3 text-red-500" />}
                {description}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}


function isEarnedType(type: number | string) {
  // Accepts both enum number and string values
  return type === 0 || type === 'KeyForCredits';
}

function TransactionCard({ transaction }: { transaction: ExchangeTransactionDto }) {
  // 0 = KeyForCredits (customer sends key, earns credits)
  // 1 = CreditsForKey (customer spends credits, gets key)
  const isEarned = isEarnedType(transaction.type);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <img
            src={transaction.coverImage?.url || transaction.steamGameMetadata?.headerImage || "/images/hero-background.jpg"}
            alt={transaction.productTitle}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-semibold text-sm truncate">{transaction.productTitle}</h4>
                <p className="text-xs text-muted-foreground">{transaction.publisherName}</p>
              </div>
              <Badge variant={isEarned ? "default" : "secondary"} className="shrink-0">
                {isEarned ? "Earned" : "Spent"}
              </Badge>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {new Date(transaction.createdAt).toLocaleDateString()}
              </span>
              <span className={`font-bold ${isEarned ? 'text-green-600' : 'text-red-600'}`}>
                {isEarned ? '+' : '-'}{transaction.creditAmount} credits
              </span>
            </div>
            {transaction.isFromBundle && (
              <div className="mt-1">
                <Badge variant="outline" className="text-xs">
                  Bundle (${transaction.tierPrice})
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


function TransactionTableRow({ transaction }: { transaction: ExchangeTransactionDto }) {
  // 0 = KeyForCredits (customer sends key, earns credits)
  // 1 = CreditsForKey (customer spends credits, gets key)
  const isEarned = isEarnedType(transaction.type);

  return (
    <tr className="hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={transaction.coverImage?.url || transaction.steamGameMetadata?.headerImage || "/images/hero-background.jpg"}
            alt={transaction.productTitle}
            className="w-10 h-10 rounded object-cover"
          />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{transaction.productTitle}</p>
            <p className="text-xs text-muted-foreground">{transaction.publisherName}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-sm">{new Date(transaction.createdAt).toLocaleDateString()}</span>
      </td>
      <td className="px-4 py-3">
        <Badge variant={isEarned ? "default" : "secondary"}>
          {isEarned ? "Earned Credits" : "Spent Credits"}
        </Badge>
      </td>
      <td className="px-4 py-3 text-right">
        <span className={`font-semibold ${isEarned ? 'text-green-600' : 'text-red-600'}`}>
          {isEarned ? '+' : '-'}{transaction.creditAmount}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-sm">${transaction.productPrice}</span>
      </td>
      <td className="px-4 py-3">
        {transaction.isFromBundle ? (
          <Badge variant="outline" className="text-xs">
            Tier ${transaction.tierPrice}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </td>
    </tr>
  );
}

function LoadingSkeleton({ isMobile }: { isMobile: boolean }) {
  if (isMobile) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="w-10 h-10 rounded" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export default function CustomerExchangeHistoryPage() {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [type, setType] = useState<string>("");
  const [dateRange, setDateRange] = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Calculate date range
  const dateParams = useMemo(() => {
    if (dateRange === "7days") {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      return { StartDate: date.toISOString() };
    } else if (dateRange === "30days") {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      return { StartDate: date.toISOString() };
    } else if (dateRange === "90days") {
      const date = new Date();
      date.setDate(date.getDate() - 90);
      return { StartDate: date.toISOString() };
    } else if (dateRange === "custom" && customStartDate) {
      return {
        StartDate: customStartDate + "T00:00:00Z",
        ...(customEndDate && { EndDate: customEndDate + "T23:59:59Z" })
      };
    }
    return {};
  }, [dateRange, customStartDate, customEndDate]);

  const { data: summaryData, isLoading: summaryLoading } = useExchangeSummary();

  const { data, isLoading, error } = useExchangeHistory({
    SearchTerm: searchTerm,
    Type: type ? Number(type) : undefined,
    ...dateParams,
    Page: page,
    PageSize: pageSize,
  });

  const totalPages = data?.totalPages || 1;

  // Generate page numbers for pagination
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = isMobile ? 3 : 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= Math.min(maxVisible - 1, totalPages); i++) {
          pages.push(i);
        }
        if (totalPages > maxVisible) pages.push(-1); // ellipsis
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push(-1); // ellipsis
        for (let i = Math.max(totalPages - (maxVisible - 2), 1); i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1); // ellipsis
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // ellipsis
        pages.push(totalPages);
      }
    }

    return pages;
  }, [page, totalPages, isMobile]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Exchange History</h1>
        <p className="text-muted-foreground mt-1">Track your credit exchanges and transactions</p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Current Balance"
          value={summaryData?.netCredits || 0}
          description={summaryData && summaryData.netCredits > 0 ? "Available credits" : "No credits"}
          icon={Activity}
          trend={summaryData && summaryData.netCredits > 0 ? "up" : "neutral"}
          loading={summaryLoading}
        />
        <SummaryCard
          title="Total Earned"
          value={summaryData?.totalCreditsEarned || 0}
          description="From exchanges"
          icon={ArrowUpRight}
          trend="up"
          loading={summaryLoading}
        />
        <SummaryCard
          title="Total Spent"
          value={summaryData?.totalCreditsSpent || 0}
          description="On new games"
          icon={ArrowDownRight}
          trend="down"
          loading={summaryLoading}
        />
        <SummaryCard
          title="Total Exchanges"
          value={(summaryData?.totalKeysSentToExchange || 0) + (summaryData?.totalKeysReceivedFromExchange || 0)}
          description="All time"
          icon={TrendingUp}
          loading={summaryLoading}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by game or publisher..."
                className="w-full pl-10 pr-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Type Filter */}
            <select
              className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Types</option>
              <option value="0">Earned Credits (Sent Keys)</option>
              <option value="1">Spent Credits (Received Keys)</option>
            </select>

            {/* Date Range */}
            <select
              className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>

            {/* Custom Date Range */}
            {dateRange === "custom" && (
              <div className="flex gap-2">
                <input
                  type="date"
                  className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
                  value={customStartDate}
                  onChange={(e) => {
                    setCustomStartDate(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Start"
                />
                <input
                  type="date"
                  className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
                  value={customEndDate}
                  onChange={(e) => {
                    setCustomEndDate(e.target.value);
                    setPage(1);
                  }}
                  placeholder="End"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Transactions
            {data && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({data.totalCount} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Failed to load exchange history.</p>
              <p className="text-sm text-muted-foreground mt-2">Please try again later.</p>
            </div>
          ) : isLoading ? (
            <LoadingSkeleton isMobile={isMobile} />
          ) : !data || data.transactions.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No transactions found</p>
              <p className="text-sm text-muted-foreground mt-2">
                {searchTerm ? "Try adjusting your search or filters" : "Your exchange history will appear here"}
              </p>
            </div>
          ) : isMobile ? (
            <div className="space-y-3">
              {data.transactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Game
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Credits
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Bundle
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.transactions.map((transaction) => (
                    <TransactionTableRow key={transaction.id} transaction={transaction} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {pageNumbers.map((pageNum, index) => (
                    pageNum === -1 ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setPage(pageNum)}
                          isActive={page === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}