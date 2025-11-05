"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { motion } from "framer-motion";
import {
  BookOpen,
  Download,
  FileText,
  FileType,
  FileAudio,
  GiftIcon,
  SearchIcon,
  XIcon,
  SparklesIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  useBookAssignments,
  useGenerateDownloadUrl,
  useCustomerBundles,
} from "@/hooks/queries/useBooks";
import { BookAssignmentDto } from "@/lib/api/types/book";
import { BulkDownloadModal } from "./bulk-download-modal";
import confetti from "canvas-confetti";
import { format } from "date-fns";

dayjs.extend(relativeTime);

// Progress levels and their requirements
const PROGRESS_LEVELS = [
  { level: 1, title: "Book Worm", required: 0, icon: "📚" },
  { level: 2, title: "Avid Reader", required: 5, icon: "📖" },
  { level: 3, title: "Literary Scholar", required: 10, icon: "🎓" },
  { level: 4, title: "Library Master", required: 25, icon: "👑" },
];

// Gift ownership filter options
const ownershipOptions = [
  { value: "All", label: "All Books" },
  { value: "Owned", label: "My Books" },
  { value: "ReceivedByMe", label: "Received as gift" },
];

// Download status filter options
const downloadStatusOptions = [
  { value: "all", label: "All" },
  { value: "true", label: "Downloaded" },
  { value: "false", label: "Not Downloaded" },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function getFormatIcon(format: string) {
  switch (format.toLowerCase()) {
    case "pdf":
      return <FileText className="h-4 w-4" />;
    case "epub":
      return <BookOpen className="h-4 w-4" />;
    case "mobi":
      return <FileType className="h-4 w-4" />;
    case "mp3":
    case "audio":
      return <FileAudio className="h-4 w-4" />;
    default:
      return <FileType className="h-4 w-4" />;
  }
}

export default function BooksLibraryPage() {
  const searchParams = useSearchParams();

  // URL query parameters
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [giftFilter, setGiftFilter] = useState<
    "All" | "Owned" | "ReceivedByMe"
  >((searchParams.get("giftFilter") as any) || "All");
  const [bundleId, setBundleId] = useState(searchParams.get("bundleId") || "");
  const [hasDownloadedBefore, setHasDownloadedBefore] = useState(
    searchParams.get("hasDownloadedBefore") || "all"
  );
  const [fromDate, setFromDate] = useState<Date | undefined>(
    searchParams.get("fromDate")
      ? new Date(searchParams.get("fromDate")!)
      : undefined
  );
  const [toDate, setToDate] = useState<Date | undefined>(
    searchParams.get("toDate")
      ? new Date(searchParams.get("toDate")!)
      : undefined
  );
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [pageSize, setPageSize] = useState(
    parseInt(searchParams.get("pageSize") || "20")
  );

  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(
    new Set()
  );
  const [showBulkDownloadModal, setShowBulkDownloadModal] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      if (searchInput !== searchQuery) {
        setPage(1);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (giftFilter !== "All") params.set("giftFilter", giftFilter);
    if (bundleId) params.set("bundleId", bundleId);
    if (hasDownloadedBefore !== "all")
      params.set("hasDownloadedBefore", hasDownloadedBefore);
    if (fromDate) params.set("fromDate", format(fromDate, "yyyy-MM-dd"));
    if (toDate) params.set("toDate", format(toDate, "yyyy-MM-dd"));
    if (page > 1) params.set("page", page.toString());
    if (pageSize !== 20) params.set("pageSize", pageSize.toString());

    const newSearch = params.toString();
    const newUrl = newSearch ? `?${newSearch}` : window.location.pathname;

    // Update URL without triggering navigation
    window.history.replaceState({}, "", newUrl);
  }, [
    searchQuery,
    giftFilter,
    bundleId,
    hasDownloadedBefore,
    fromDate,
    toDate,
    page,
    pageSize,
  ]);

  // Fetch customer bundles for filter dropdown
  const { data: customerBundles = [] } = useCustomerBundles();

  // Build query params for API
  const queryParams = useMemo(() => {
    const timezoneOffset = new Date().getTimezoneOffset();
    return {
      search: searchQuery || undefined,
      giftFilter: giftFilter !== "All" ? giftFilter : undefined,
      bundleId: bundleId || undefined,
      hasDownloadedBefore:
        hasDownloadedBefore !== "all"
          ? hasDownloadedBefore === "true"
          : undefined,
      fromDate: fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
      toDate: toDate ? format(toDate, "yyyy-MM-dd") : undefined,
      timezoneOffset,
      page,
      pageSize,
    };
  }, [
    searchQuery,
    giftFilter,
    bundleId,
    hasDownloadedBefore,
    fromDate,
    toDate,
    page,
    pageSize,
  ]);

  // Fetch book assignments
  const {
    data: bookData,
    isLoading,
    isError,
    error,
  } = useBookAssignments(queryParams);

  const bookAssignments = bookData?.items || [];
  const totalBooks = bookData?.total || 0;
  const totalPages = Math.ceil(totalBooks / pageSize);

  const generateDownloadUrl = useGenerateDownloadUrl();

  // Calculate user's progress
  const currentLevel = PROGRESS_LEVELS.reduce(
    (acc, level) => (totalBooks >= level.required ? level : acc),
    PROGRESS_LEVELS[0]
  );

  // Helper function to check if a book is newly assigned (within 30 days)
  const isNewlyAssigned = (book: BookAssignmentDto): boolean => {
    if (!book.assignedAt) return false;

    const assignedDate = dayjs(book.assignedAt);
    const thirtyDaysAgo = dayjs().subtract(30, "day");

    return assignedDate.isAfter(thirtyDaysAgo);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.8 },
      colors: ["#4F46E5", "#EC4899", "#10B981", "#F59E0B", "#6366F1"],
      gravity: 0.5,
      scalar: 0.7,
      ticks: 60,
    });
  };

  const handleDownload = (
    assignmentId: string,
    bookFileId: string,
    fileName: string
  ) => {
    // Track downloading state
    const fileKey = `${assignmentId}-${bookFileId}`;
    setDownloadingFiles((prev) => new Set(prev).add(fileKey));

    // The mutation now handles all the download logic and progress
    generateDownloadUrl.mutate(
      { assignmentId, bookFileId, fileName },
      {
        onSuccess: () => {
          // Trigger confetti only on successful download
          triggerConfetti();
        },
        onSettled: () => {
          // Remove from downloading state when complete
          setDownloadingFiles((prev) => {
            const next = new Set(prev);
            next.delete(fileKey);
            return next;
          });
        },
      }
    );
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setGiftFilter("All");
    setBundleId("");
    setHasDownloadedBefore("all");
    setFromDate(undefined);
    setToDate(undefined);
    setPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    giftFilter !== "All" ||
    bundleId ||
    hasDownloadedBefore !== "all" ||
    fromDate ||
    toDate;

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Book Library</h1>
      </div>

      <Card className="bg-card border shadow-xs">
        <CardHeader className="pb-2">
          <h2 className="text-sm text-muted-foreground font-medium">Filters</h2>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          {/* Search and Basic Filters */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search Filter */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Search
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search books..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
            </div>

            {/* Bundle Filter */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Bundle
              </label>
              <Select
                value={bundleId || "all"}
                onValueChange={(value) => {
                  setBundleId(value === "all" ? "" : value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Bundles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bundles</SelectItem>
                  {customerBundles.map((bundle) => (
                    <SelectItem key={bundle.id} value={bundle.id}>
                      {bundle.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Download Status Filter */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Download Status
              </label>
              <Select
                value={hasDownloadedBefore}
                onValueChange={(value) => {
                  setHasDownloadedBefore(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {downloadStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ownership Filter */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Ownership
              </label>
              <Select
                value={giftFilter}
                onValueChange={(value: any) => {
                  setGiftFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ownershipOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Filters */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Purchase Date From
              </label>
              <Input
                type="date"
                value={fromDate ? format(fromDate, "yyyy-MM-dd") : ""}
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  const target = e.target as HTMLInputElement;
                  if (target.value && target.validity.valid) {
                    setFromDate(new Date(target.value));
                    setPage(1);
                  } else if (!target.value) {
                    setFromDate(undefined);
                    setPage(1);
                  }
                }}
                max={new Date().toISOString().split("T")[0]}
                className="bg-background"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Purchase Date To
              </label>
              <Input
                type="date"
                value={toDate ? format(toDate, "yyyy-MM-dd") : ""}
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  const target = e.target as HTMLInputElement;
                  if (target.value && target.validity.valid) {
                    setToDate(new Date(target.value));
                    setPage(1);
                  } else if (!target.value) {
                    setToDate(undefined);
                    setPage(1);
                  }
                }}
                min={fromDate ? format(fromDate, "yyyy-MM-dd") : undefined}
                max={new Date().toISOString().split("T")[0]}
                className="bg-background"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="gap-2"
              >
                <XIcon className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-linear-to-br from-card to-card/95 dark:from-[#1a1d2e] dark:to-[#1a1d2e]/95 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Available Books
              {totalBooks > 0 && (
                <span className="text-sm text-muted-foreground">
                  &nbsp; ({totalBooks} total)
                </span>
              )}
            </CardTitle>
            {hasActiveFilters && totalBooks > 0 && (
              <Button
                onClick={() => setShowBulkDownloadModal(true)}
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Bulk Download
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex min-h-[80vh] flex-col items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-sm text-muted-foreground">
                Loading your book library...
              </p>
            </div>
          ) : isError ? (
            <div className="flex min-h-[80vh] flex-col items-center justify-center p-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center rounded-lg border bg-card/30 p-8 text-center"
              >
                <div className="mb-4 rounded-full bg-red-100 p-3">
                  <BookOpen className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  Error loading books
                </h3>
                <p className="mb-6 max-w-md text-muted-foreground">
                  {error instanceof Error
                    ? error.message
                    : "Something went wrong"}
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-linear-to-r from-primary to-primary/90"
                >
                  Try Again
                </Button>
              </motion.div>
            </div>
          ) : bookAssignments.length === 0 && !hasActiveFilters ? (
            <div className="flex min-h-[80vh] flex-col items-center justify-center p-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center text-center"
              >
                <div className="mb-4 rounded-full bg-primary/10 p-6">
                  <BookOpen className="h-12 w-12 text-primary" />
                </div>
                <h3 className="mb-2 text-2xl font-semibold">No books yet</h3>
                <p className="mb-6 max-w-md text-muted-foreground">
                  Start building your digital library by purchasing a bundle
                  with books!
                </p>
                <Link href="/bundles">
                  <Button className="bg-linear-to-r from-primary to-primary/90">
                    Browse Bundles
                  </Button>
                </Link>
              </motion.div>
            </div>
          ) : bookAssignments.length === 0 && hasActiveFilters ? (
            <div className="flex min-h-[80vh] flex-col items-center justify-center p-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center text-center"
              >
                <div className="mb-4 rounded-full bg-muted p-6">
                  <SearchIcon className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-2xl font-semibold">
                  No results found
                </h3>
                <p className="mb-6 max-w-md text-muted-foreground">
                  We couldn't find any books matching your search criteria. Try
                  adjusting your filters.
                </p>
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="gap-2"
                >
                  <XIcon className="h-4 w-4" />
                  Clear All Filters
                </Button>
              </motion.div>
            </div>
          ) : (
            <div className="h-[70vh] overflow-auto p-4 pb-0 space-y-4">
              {bookAssignments.map((book) => {
                const bookTitle =
                  book.book?.title || book.bookTitle || book.productTitle;
                const activeFiles =
                  book.availableFiles?.filter(
                    (file) => file.status === "Active"
                  ) || [];

                return (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative flex flex-col gap-4 rounded-lg border bg-card/30 p-4 sm:flex-row sm:items-center sm:justify-between transition-all duration-200 hover:bg-card/50 hover:shadow-lg hover:border-primary/20 dark:hover:bg-[#1d2233]/60 dark:hover:shadow-blue-500/5"
                  >
                    <div className="flex gap-4 flex-1">
                      {/* Product Cover Image - 2:3 aspect ratio */}
                      <div className="flex-shrink-0">
                        <div className="h-20 aspect-[2/3]">
                          <img
                            src={
                              book.productCoverImage?.url ||
                              "https://static.digiphile.co/product-placeholder-image.jpg"
                            }
                            alt={bookTitle || "Book"}
                            className="w-full h-full object-contain rounded-lg shadow-md"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">
                            {bookTitle}
                            {book.book?.author && (
                              <span className="text-sm font-normal text-muted-foreground ml-2">
                                by {book.book.author}
                              </span>
                            )}
                          </h3>
                          {isNewlyAssigned(book) && (
                            <Badge
                              variant="outline"
                              className="animate-subtle-pulse bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                            >
                              <SparklesIcon className="h-3 w-3 mr-1" />
                              New
                            </Badge>
                          )}
                          {book.isGift && (
                            <Badge variant="secondary" className="gap-1">
                              <GiftIcon className="h-3 w-3" />
                              Gift
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Added on{" "}
                            {book.assignedAt
                              ? new Date(book.assignedAt).toLocaleDateString()
                              : "Unknown"}
                            {book.downloadCount > 0 ? (
                              <>
                                {" "}
                                • Downloaded {book.downloadCount} time
                                {book.downloadCount !== 1 ? "s" : ""}
                                {book.lastDownloadAt && (
                                  <>
                                    {" "}
                                    • Last:{" "}
                                    {dayjs(book.lastDownloadAt).fromNow()}
                                  </>
                                )}
                              </>
                            ) : (
                              <> • Never downloaded</>
                            )}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {activeFiles.map((file) => (
                              <span
                                key={file.id}
                                className="flex items-center gap-1"
                              >
                                {getFormatIcon(file.fileFormat)}
                                {file.fileFormat.toUpperCase()} (
                                {formatBytes(file.fileSizeBytes)})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {book.status === "Active" ? (
                        <>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button className="cursor-pointer gap-2 bg-linear-to-r from-primary to-primary/90 dark:ring-1 dark:ring-blue-400/30 dark:hover:ring-blue-500/60 focus:outline-none focus-visible:outline-none">
                                <Download className="h-4 w-4" />
                                Download
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {activeFiles.length === 0 ? (
                                <DropdownMenuItem disabled>
                                  No files available
                                </DropdownMenuItem>
                              ) : (
                                activeFiles.map((file) => {
                                  const fileKey = `${book.id}-${file.id}`;
                                  const isDownloading =
                                    downloadingFiles.has(fileKey);

                                  return (
                                    <DropdownMenuItem
                                      key={file.id}
                                      onClick={() =>
                                        !isDownloading &&
                                        handleDownload(
                                          book.id,
                                          file.id,
                                          file.fileName
                                        )
                                      }
                                      className="flex items-center justify-between cursor-pointer"
                                      disabled={isDownloading}
                                    >
                                      <span className="flex items-center gap-2">
                                        {isDownloading ? (
                                          <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                            <span className="text-muted-foreground">
                                              Downloading...
                                            </span>
                                          </>
                                        ) : (
                                          <>
                                            {getFormatIcon(file.fileFormat)}
                                            {file.fileFormat.toUpperCase()}
                                          </>
                                        )}
                                      </span>
                                      {!isDownloading && (
                                        <span className="text-xs text-muted-foreground">
                                          {formatBytes(file.fileSizeBytes)}
                                        </span>
                                      )}
                                    </DropdownMenuItem>
                                  );
                                })
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-muted-foreground"
                        >
                          {book.status}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Pagination */}
              {totalBooks > 0 && (
                <div className="sticky bottom-0 bg-card border-t mt-4 p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Show:</span>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => {
                        setPageSize(parseInt(value));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="text-sm text-muted-foreground min-w-[100px] text-center">
                      Page {page} of {totalPages}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Download Modal */}
      <BulkDownloadModal
        isOpen={showBulkDownloadModal}
        onClose={() => setShowBulkDownloadModal(false)}
        filterParams={{
          search: searchQuery || undefined,
          giftFilter: giftFilter !== "All" ? giftFilter : undefined,
          bundleId: bundleId || undefined,
          hasDownloadedBefore:
            hasDownloadedBefore !== "all"
              ? hasDownloadedBefore === "true"
              : undefined,
          fromDate: fromDate ? format(fromDate, "yyyy-MM-dd") : undefined,
          toDate: toDate ? format(toDate, "yyyy-MM-dd") : undefined,
        }}
        totalBooks={totalBooks}
      />
    </div>
  );
}
