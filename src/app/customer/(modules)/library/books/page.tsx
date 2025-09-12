"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useBookAssignments, useGenerateDownloadUrl } from "@/hooks/queries/useBooks";
import { BookAssignmentDto } from "@/lib/api/types/book";
import { FilterDropdown } from "@/customer/components/filter-dropdown";
import { useAuth } from "@/app/(shared)/providers/auth-provider";
import confetti from "canvas-confetti";

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

// Status filter options
const statusOptions = [
  { value: "All", label: "All Statuses" },
  { value: "Active", label: "Active" },
  { value: "Refunded", label: "Refunded" },
  { value: "Expired", label: "Expired" },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

function getFormatIcon(format: string) {
  switch (format.toLowerCase()) {
    case 'pdf':
      return <FileText className="h-4 w-4" />;
    case 'epub':
      return <BookOpen className="h-4 w-4" />;
    case 'mobi':
      return <FileType className="h-4 w-4" />;
    case 'mp3':
    case 'audio':
      return <FileAudio className="h-4 w-4" />;
    default:
      return <FileType className="h-4 w-4" />;
  }
}

const downloadMessages = [
  "📚 Starting your reading adventure!",
  "📖 Knowledge coming your way!",
  "🚀 Downloading your next great read!",
  "✨ Your book is ready!",
];

export default function BooksLibraryPage() {
  const { user } = useAuth();
  const currentCustomerId = user?.id;
  const currentUserEmail = user?.email;
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [giftFilter, setGiftFilter] = useState<"All" | "Owned" | "ReceivedByMe">("All");
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch book assignments
  const { data: bookAssignments = [], isLoading, isError, error } = useBookAssignments({ giftFilter });
  const generateDownloadUrl = useGenerateDownloadUrl();

  // Filter books based on search and status
  const filteredBooks = React.useMemo(() => {
    return bookAssignments.filter((book) => {
      // Search filter
      if (debouncedSearchQuery) {
        const searchLower = debouncedSearchQuery.toLowerCase();
        const titleMatch = (book.bookTitle || book.productTitle || '').toLowerCase().includes(searchLower);
        if (!titleMatch) return false;
      }

      // Status filter
      if (statusFilter !== "All" && book.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [bookAssignments, debouncedSearchQuery, statusFilter]);

  // Calculate ownership counts
  const ownershipOptionsWithCounts = React.useMemo(() => {
    return ownershipOptions.map((option) => ({
      ...option,
      count: bookAssignments.filter((book) => {
        if (option.value === "All") return true;
        if (option.value === "Owned") return !book.isGift;
        if (option.value === "ReceivedByMe") return book.isGift;
        return false;
      }).length,
    }));
  }, [bookAssignments]);

  // Calculate status counts
  const statusOptionsWithCounts = React.useMemo(() => {
    return statusOptions.map((option) => ({
      ...option,
      count: bookAssignments.filter((book) => {
        if (option.value === "All") return true;
        return book.status === option.value;
      }).length,
    }));
  }, [bookAssignments]);

  // Calculate user's progress
  const currentLevel = PROGRESS_LEVELS.reduce(
    (acc, level) => (bookAssignments.length >= level.required ? level : acc),
    PROGRESS_LEVELS[0]
  );

  const nextLevel = PROGRESS_LEVELS[PROGRESS_LEVELS.indexOf(currentLevel) + 1];

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

  const handleDownload = (assignmentId: string, bookFileId: string, fileName: string) => {
    // Track downloading state
    const fileKey = `${assignmentId}-${bookFileId}`;
    setDownloadingFiles(prev => new Set(prev).add(fileKey));
    
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
          setDownloadingFiles(prev => {
            const next = new Set(prev);
            next.delete(fileKey);
            return next;
          });
        }
      }
    );
  };

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
          {/* Search Filter */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-3 lg:col-span-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Search
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by book title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
            </div>

            {/* Status Filter */}
            <FilterDropdown
              label="Status"
              options={statusOptionsWithCounts}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="All Statuses"
              searchPlaceholder="Search status..."
              className="sm:col-span-1"
            />

            {/* Ownership Filter */}
            <FilterDropdown
              label="Ownership"
              options={ownershipOptionsWithCounts}
              value={giftFilter}
              onChange={(value) => setGiftFilter(value as "All" | "Owned" | "ReceivedByMe")}
              placeholder="All Books"
              searchPlaceholder="Search ownership..."
              showCounts={false}
              className="sm:col-span-1"
            />
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || statusFilter !== "All" || giftFilter !== "All") && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("All");
                  setGiftFilter("All");
                }}
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
          <CardTitle>
            Available Books
            {filteredBooks.length > 0 && (
              <span className="text-sm text-muted-foreground">
                &nbsp; ({filteredBooks.length} found)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-sm text-muted-foreground">
                Loading your book library...
              </p>
            </div>
          ) : isError ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-lg border bg-card/30 p-8 text-center"
            >
              <div className="mb-4 rounded-full bg-red-100 p-3">
                <BookOpen className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Error loading books</h3>
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
          ) : filteredBooks.length === 0 && !debouncedSearchQuery && statusFilter === "All" ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-lg border bg-card/30 p-8 text-center"
            >
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                {giftFilter === "ReceivedByMe" ? (
                  <GiftIcon className="h-8 w-8 text-primary" />
                ) : (
                  <BookOpen className="h-8 w-8 text-primary" />
                )}
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                {giftFilter === "Owned"
                  ? "No personal books yet"
                  : giftFilter === "ReceivedByMe"
                    ? "No books received as gifts yet"
                    : "No books in your library yet"}
              </h3>
              <p className="mb-6 max-w-md text-muted-foreground">
                {giftFilter === "Owned"
                  ? "Purchase a bundle with books to get started with your personal library!"
                  : giftFilter === "ReceivedByMe"
                    ? "When someone gifts you books, they'll appear here."
                    : "Purchase a bundle with books to build your digital library!"}
              </p>
              {giftFilter !== "ReceivedByMe" && (
                <Link href="/bundles">
                  <Button className="bg-linear-to-r from-primary to-primary/90">
                    Browse Bundles
                  </Button>
                </Link>
              )}
            </motion.div>
          ) : filteredBooks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-lg border bg-card/30 p-8 text-center"
            >
              <div className="mb-4 rounded-full bg-secondary/10 p-3">
                <SearchIcon className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">No results found</h3>
              <p className="mb-6 max-w-md text-muted-foreground">
                We couldn&apos;t find any books matching your search criteria.
                Try adjusting your filters or search term.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setDebouncedSearchQuery("");
                  setStatusFilter("All");
                  setGiftFilter("All");
                }}
                className="gap-2"
              >
                <XIcon className="h-4 w-4" />
                Clear Filters
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredBooks.map((book) => {
                const activeFiles = book.availableFiles?.filter(file => file.status === 'Active') || [];
                
                return (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative flex flex-col gap-4 rounded-lg border bg-card/30 p-4 sm:flex-row sm:items-center sm:justify-between transition-all duration-200 hover:bg-card/50 hover:shadow-lg hover:border-primary/20 dark:hover:bg-[#1d2233]/60 dark:hover:shadow-blue-500/5"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{book.bookTitle || book.productTitle}</h3>
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
                              • Downloaded {book.downloadCount} time{book.downloadCount !== 1 ? 's' : ''}
                              {book.lastDownloadAt && (
                                <> • Last: {dayjs(book.lastDownloadAt).fromNow()}</>
                              )}
                            </>
                          ) : (
                            <> • Never downloaded</>
                          )}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {activeFiles.map((file, index) => (
                            <span key={file.id} className="flex items-center gap-1">
                              {getFormatIcon(file.fileFormat)}
                              {file.fileFormat.toUpperCase()} ({formatBytes(file.fileSizeBytes)})
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {book.status === "Active" ? (
                        <>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                className="cursor-pointer gap-2 bg-linear-to-r from-primary to-primary/90 dark:ring-1 dark:ring-blue-400/30 dark:hover:ring-blue-500/60 focus:outline-none focus-visible:outline-none"
                              >
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
                                  const isDownloading = downloadingFiles.has(fileKey);
                                  
                                  return (
                                    <DropdownMenuItem
                                      key={file.id}
                                      onClick={() => !isDownloading && handleDownload(book.id, file.id, file.fileName)}
                                      className="flex items-center justify-between cursor-pointer"
                                      disabled={isDownloading}
                                    >
                                      <span className="flex items-center gap-2">
                                        {isDownloading ? (
                                          <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                            <span className="text-muted-foreground">Downloading...</span>
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}