"use client";

import React, { useState } from "react";
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
  Calendar,
  User,
  GiftIcon,
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
import { BookAssignmentDto, BookFileDto } from "@/lib/api/types/book";
import { FilterDropdown } from "@/customer/components/filter-dropdown";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const ownershipOptions = [
  { value: "All", label: "All Books" },
  { value: "Owned", label: "Purchased" },
  { value: "ReceivedByMe", label: "Gifted to Me" },
];

const PROGRESS_LEVELS = [
  { level: 1, title: "Book Worm", required: 0, icon: "📚" },
  { level: 2, title: "Avid Reader", required: 5, icon: "📖" },
  { level: 3, title: "Literary Scholar", required: 10, icon: "🎓" },
  { level: 4, title: "Library Master", required: 25, icon: "👑" },
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

function BookAssignmentCard({ 
  assignment,
  onDownload 
}: { 
  assignment: BookAssignmentDto;
  onDownload: (assignmentId: string, bookFileId: string, fileName: string) => void;
}) {
  const [showFormats, setShowFormats] = useState(false);
  const activeFiles = assignment.availableFiles?.filter(file => file.status === 'Active') || [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-blue-500/50">
        {assignment.isGift && (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-500/20">
              <GiftIcon className="h-3 w-3 mr-1" />
              Gift
            </Badge>
          </div>
        )}
        
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-800">
          {/* Placeholder for book cover - you might want to add an image URL to the assignment */}
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-20 w-20 text-gray-400" />
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {assignment.bookTitle || assignment.productTitle}
          </h3>
          
          <div className="space-y-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="default" 
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download ({activeFiles.length} formats)
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {activeFiles.map((file) => (
                  <DropdownMenuItem
                    key={file.id}
                    onClick={() => onDownload(assignment.id, file.id, file.fileName)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      {getFormatIcon(file.fileFormat)}
                      {file.fileFormat.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatBytes(file.fileSizeBytes)}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {assignment.downloadCount} downloads
              </span>
              {assignment.lastDownloadAt && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-xs">
                        {dayjs(assignment.lastDownloadAt).fromNow()}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Last download: {dayjs(assignment.lastDownloadAt).format("MMM D, YYYY h:mm A")}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function BooksLibraryPage() {
  const [giftFilter, setGiftFilter] = useState<"All" | "Owned" | "ReceivedByMe">("All");
  
  const { data: assignments = [], isLoading } = useBookAssignments({ giftFilter });
  const generateDownloadUrl = useGenerateDownloadUrl();

  const filteredAssignments = assignments;

  const handleDownload = (assignmentId: string, bookFileId: string, fileName: string) => {
    generateDownloadUrl.mutate({ assignmentId, bookFileId, fileName });
  };

  const getCurrentLevel = () => {
    const totalBooks = assignments.length;
    for (let i = PROGRESS_LEVELS.length - 1; i >= 0; i--) {
      if (totalBooks >= PROGRESS_LEVELS[i].required) {
        return PROGRESS_LEVELS[i];
      }
    }
    return PROGRESS_LEVELS[0];
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = PROGRESS_LEVELS[PROGRESS_LEVELS.findIndex(l => l.level === currentLevel.level) + 1];
  const progressToNextLevel = nextLevel
    ? ((assignments.length - currentLevel.required) / (nextLevel.required - currentLevel.required)) * 100
    : 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">My Book Library</h1>
        <p className="text-muted-foreground">
          Access and download all your purchased and gifted ebooks in multiple formats
        </p>
      </div>

      {/* Progress Section */}
      <Card className="mb-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{currentLevel.icon}</span>
              <div>
                <h3 className="font-semibold text-lg">{currentLevel.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {assignments.length} books in your library
                </p>
              </div>
            </div>
            {nextLevel && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {nextLevel.required - assignments.length} more to {nextLevel.title}
                </p>
              </div>
            )}
          </div>
          {nextLevel && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressToNextLevel}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-end">
        <FilterDropdown
          label="Filter"
          value={giftFilter}
          onChange={(value) => setGiftFilter(value as typeof giftFilter)}
          options={ownershipOptions}
        />
      </div>

      {/* Books Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700" />
              <CardContent className="p-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAssignments.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No books found</h3>
          <p className="text-muted-foreground">
            {giftFilter !== "All"
              ? "Try changing your filter settings"
              : "Purchase book bundles to build your library"}
          </p>
        </Card>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAssignments.map((assignment) => (
              <BookAssignmentCard
                key={assignment.id}
                assignment={assignment}
                onDownload={handleDownload}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}