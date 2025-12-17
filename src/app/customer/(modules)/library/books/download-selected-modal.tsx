"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Download, Loader2, XIcon } from "lucide-react";
import { useBulkDownloadByIds } from "@/hooks/queries/useBooks";
import { Badge } from "@/shared/components/ui/badge";

interface DownloadSelectedModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBookIds: string[];
  onRemoveBook: (bookId: string) => void;
  bookAssignmentsMap: Map<string, { title: string; coverImageUrl?: string }>;
}

const fileTypeOptions = [
  { value: "PDF", label: "PDF" },
  { value: "EPUB", label: "EPUB" },
  { value: "MOBI", label: "MOBI" },
];

export function DownloadSelectedModal({
  isOpen,
  onClose,
  selectedBookIds,
  onRemoveBook,
  bookAssignmentsMap,
}: DownloadSelectedModalProps) {
  const [preferredFileType, setPreferredFileType] = useState("PDF");
  const bulkDownloadByIds = useBulkDownloadByIds();

  // Close modal when all books are removed
  useEffect(() => {
    if (isOpen && selectedBookIds.length === 0) {
      onClose();
    }
  }, [selectedBookIds.length, isOpen, onClose]);

  const handleDownload = async () => {
    await bulkDownloadByIds.mutateAsync({
      bookAssignmentIds: selectedBookIds,
      preferredFileType,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Download Selected Books</DialogTitle>
          <DialogDescription>
            You have selected {selectedBookIds.length} book{selectedBookIds.length !== 1 ? 's' : ''} for download.
            Choose your preferred file format and click download to create a ZIP file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Type Selector */}
          <div className="relative z-50">
            <label className="text-sm font-medium mb-2 block">
              Preferred File Format
            </label>
            <Select value={preferredFileType} onValueChange={setPreferredFileType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                {fileTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              If the selected format is not available for a book, the next available format will be used.
            </p>
          </div>

          {/* Selected Books List */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Selected Books ({selectedBookIds.length})
            </label>
            <div className="space-y-2 max-h-[40vh] overflow-y-auto border rounded-lg p-3 bg-muted/20">
              {selectedBookIds.map((bookId) => {
                const book = bookAssignmentsMap.get(bookId);
                return (
                  <div
                    key={bookId}
                    className="flex items-center gap-3 p-3 bg-card rounded-lg border hover:border-primary/30 transition-colors"
                  >
                    {book?.coverImageUrl && (
                      <div className="h-12 aspect-[2/3] flex-shrink-0">
                        <img
                          src={book.coverImageUrl}
                          alt={book.title}
                          className="w-full h-full object-contain rounded shadow-sm"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{book?.title || "Unknown Book"}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveBook(bookId)}
                      className="flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleDownload}
            disabled={bulkDownloadByIds.isPending || selectedBookIds.length === 0}
            className="gap-2"
          >
            {bulkDownloadByIds.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Preparing Download...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download {selectedBookIds.length} Book{selectedBookIds.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
