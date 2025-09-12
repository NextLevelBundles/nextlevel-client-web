"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/app/(shared)/utils/tailwind";

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        "prose-headings:font-semibold",
        "prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
        "prose-p:text-muted-foreground prose-p:leading-relaxed",
        "prose-strong:text-foreground prose-strong:font-semibold",
        "prose-ul:list-disc prose-ul:pl-6",
        "prose-ol:list-decimal prose-ol:pl-6",
        "prose-li:text-muted-foreground prose-li:marker:text-muted-foreground",
        "prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:italic",
        "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono",
        "prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto",
        "prose-a:text-primary prose-a:no-underline prose-a:font-medium hover:prose-a:underline",
        "prose-img:rounded-lg prose-img:shadow-md",
        "prose-hr:border-border",
        "prose-table:overflow-x-auto",
        "prose-th:text-left prose-th:font-semibold prose-th:text-foreground",
        "prose-td:text-muted-foreground",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Custom link renderer to handle external links
        a: ({ node, children, href, ...props }) => {
          const isExternal = href?.startsWith("http");
          return (
            <a
              href={href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="text-primary hover:underline"
              {...props}
            >
              {children}
            </a>
          );
        },
        // Custom code block renderer
        pre: ({ children, ...props }) => {
          return (
            <pre
              className="bg-muted p-4 rounded-lg overflow-x-auto"
              {...props}
            >
              {children}
            </pre>
          );
        },
        // Custom inline code renderer
        code: ({ node, inline, children, ...props }) => {
          if (inline) {
            return (
              <code
                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          }
          return <code {...props}>{children}</code>;
        },
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}