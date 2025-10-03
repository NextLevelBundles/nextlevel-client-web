"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/(shared)/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/app/(shared)/components/ui/progress";
import { FileArchive, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { useBulkDownload } from "@/hooks/queries/useBooks";
import { BulkDownloadParams } from "@/lib/api/types/book";

interface BulkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterParams: Omit<BulkDownloadParams, "preferredFileType">;
  totalBooks: number;
}

const fileFormats = [
  { value: "PDF", label: "PDF", description: "Best for printing and reading on any device" },
  { value: "EPUB", label: "EPUB", description: "Best for e-readers like Kindle, Kobo" },
  { value: "MOBI", label: "MOBI", description: "Legacy Kindle format" },
];

export function BulkDownloadModal({
  isOpen,
  onClose,
  filterParams,
  totalBooks,
}: BulkDownloadModalProps) {
  const [preferredFileType, setPreferredFileType] = useState("PDF");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  const bulkDownload = useBulkDownload();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setDownloadProgress(0);
      setIsGenerating(false);
      setIsDownloading(false);
      setDownloadComplete(false);
      setPreferredFileType("PDF");
    }
  }, [isOpen]);

  // Simulate progress for generating ZIP
  useEffect(() => {
    if (isGenerating && downloadProgress < 30) {
      const timer = setTimeout(() => {
        setDownloadProgress((prev) => Math.min(prev + 5, 30));
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isGenerating, downloadProgress]);

  // Simulate progress for downloading
  useEffect(() => {
    if (isDownloading && downloadProgress < 95) {
      const timer = setTimeout(() => {
        setDownloadProgress((prev) => Math.min(prev + 10, 95));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isDownloading, downloadProgress]);

  const handleDownload = async () => {
    setIsGenerating(true);
    setDownloadProgress(0);

    bulkDownload.mutate(
      {
        ...filterParams,
        preferredFileType,
      },
      {
        onSuccess: () => {
          setIsGenerating(false);
          setIsDownloading(true);
          setDownloadProgress(40);

          // Simulate download completion
          setTimeout(() => {
            setDownloadProgress(100);
            setIsDownloading(false);
            setDownloadComplete(true);

            // Close modal after a short delay
            setTimeout(() => {
              onClose();
            }, 2000);
          }, 2000);
        },
        onError: () => {
          setIsGenerating(false);
          setIsDownloading(false);
          setDownloadProgress(0);
        },
      }
    );
  };

  const isProcessing = isGenerating || isDownloading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileArchive className="h-5 w-5" />
            Bulk Download Books
          </DialogTitle>
          <DialogDescription>
            Download {totalBooks} {totalBooks === 1 ? "book" : "books"} matching your current filters as a ZIP file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isProcessing && !downloadComplete ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Preferred File Format
                </label>
                <select
                  value={preferredFileType}
                  onChange={(e) => setPreferredFileType(e.target.value)}
                  disabled={isProcessing}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {fileFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  {fileFormats.find(f => f.value === preferredFileType)?.description}
                </p>
              </div>

              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3">
                <div className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="text-sm text-amber-700 dark:text-amber-300">
                    <p className="font-medium mb-1">Note about formats:</p>
                    <p className="text-xs">
                      If your preferred format is not available for a book, we'll automatically
                      include an available format instead so you don't miss any content.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {downloadComplete ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="font-medium">Download Complete!</p>
                  <p className="text-sm text-muted-foreground">
                    Your books have been saved to your Downloads folder
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center py-2">
                    <div className="animate-pulse">
                      <FileArchive className="h-12 w-12 text-primary mx-auto mb-3" />
                    </div>
                    <p className="font-medium">
                      {isGenerating ? "Preparing your books..." : "Downloading ZIP file..."}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isGenerating
                        ? "We're collecting and packaging your books"
                        : "Your download will start automatically"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Progress value={downloadProgress} className="h-2" />
                    <p className="text-xs text-center text-muted-foreground">
                      {downloadProgress}% complete
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {!isProcessing && !downloadComplete ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleDownload} disabled={!preferredFileType}>
                <Download className="mr-2 h-4 w-4" />
                Download ZIP
              </Button>
            </>
          ) : downloadComplete ? (
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          ) : (
            <Button disabled className="w-full">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                {isGenerating ? "Preparing..." : "Downloading..."}
              </div>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}