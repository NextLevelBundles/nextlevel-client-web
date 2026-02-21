"use client";

import { Card } from "@/app/(shared)/components/ui/card";
import { MessageSquare, ChevronDown } from "lucide-react";
import { cn } from "@/app/(shared)/utils/tailwind";
import { useState, useRef, useEffect, memo } from "react";

interface CuratorCommentsProps {
  content: string;
  className?: string;
  compact?: boolean;
}

export const CuratorComments = memo(function CuratorComments({
  content,
  className,
  compact = false,
}: CuratorCommentsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const maxHeight = compact ? 150 : 200;
      const scrollHeight = contentRef.current.scrollHeight;
      setShowReadMore(scrollHeight > maxHeight);
    }
  }, [compact, content]);

  if (!content || content.trim() === "") {
    return null;
  }

  if (compact) {
    return (
      <Card
        className={cn(
          "relative overflow-hidden",
          "bg-gradient-to-br from-card to-primary/5",
          "border border-primary/15",
          className
        )}
      >
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl" />

        <div className="relative p-4">
          {/* Compact Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold">Curator&apos;s Note</h3>
          </div>

          {/* Content */}
          <div className="relative">
            <div className="absolute -left-1 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 to-transparent rounded-full" />
            <div
              ref={contentRef}
              className={cn(
                "pl-3 overflow-hidden transition-all duration-300 prose prose-sm max-w-none",
                "[&_p:empty]:min-h-[1.5em]",
                "[&_iframe]:w-full",
                "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2",
                "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2",
                "[&_li]:my-1",
                !isExpanded && "max-h-[150px]"
              )}
              dangerouslySetInnerHTML={{ __html: content }}
            />
            {/* Gradient overlay when collapsed */}
            {!isExpanded && showReadMore && (
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
            )}
          </div>

          {/* Read more button */}
          {showReadMore && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
            >
              <span>{isExpanded ? "Show less" : "Read more"}</span>
              <ChevronDown
                className={cn(
                  "w-3 h-3 transition-transform duration-300",
                  isExpanded && "rotate-180"
                )}
              />
            </button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden",
        "bg-gray-50/95 dark:bg-card/70 backdrop-blur-xs border border-gray-100 dark:border-border shadow-xs transition-all duration-300",
        className
      )}
    >
      <div className="p-6">
        {/* Header - clickable to expand/collapse */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10">
              <MessageSquare className="w-4.5 h-4.5 text-primary" />
            </div>
            <h3 className="text-base font-semibold">Curator&apos;s Note</h3>
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-300",
              isExpanded && "rotate-180"
            )}
          />
        </button>

        {/* Content */}
        <div className="relative mt-4">
          <div
            ref={contentRef}
            className={cn(
              "overflow-hidden transition-all duration-300 prose prose-sm md:prose-base max-w-none",
              "[&_p:empty]:min-h-[1.5em]",
              "[&_iframe]:w-full",
              "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2",
              "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2",
              "[&_li]:my-1",
              !isExpanded && "max-h-[200px]"
            )}
            dangerouslySetInnerHTML={{ __html: content }}
          />
          {/* Gradient overlay when collapsed */}
          {!isExpanded && showReadMore && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 dark:from-card to-transparent pointer-events-none" />
          )}
        </div>

        {/* Read more button */}
        {showReadMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
          >
            <span>{isExpanded ? "Show less" : "Read more"}</span>
            <ChevronDown
              className={cn(
                "w-3 h-3 transition-transform duration-300",
                isExpanded && "rotate-180"
              )}
            />
          </button>
        )}
      </div>
    </Card>
  );
});
