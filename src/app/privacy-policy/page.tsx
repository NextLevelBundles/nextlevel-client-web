import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/app/(home)/components/sections/footer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { CookieSettingsLink } from "./cookie-settings-link";

export const metadata: Metadata = {
  title: "Privacy Policy | Digiphile",
  description:
    "Read the Privacy Policy for Digiphile. Expert-curated, premium game and book collections from Humble Bundle vets.",
  openGraph: {
    title: "Privacy Policy | Digiphile",
    description:
      "Read the Privacy Policy for Digiphile. Expert-curated, premium game and book collections from Humble Bundle vets.",
    images: [
      {
        url: "https://static.digiphile.co/digiphile-social.jpg",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Digiphile",
    description:
      "Read the Privacy Policy for Digiphile. Expert-curated, premium game and book collections from Humble Bundle vets.",
    images: ["https://static.digiphile.co/digiphile-social.jpg"],
  },
};

export default function PrivacyPolicy() {
  // Read the markdown file from the assets folder
  const markdownPath = path.join(
    process.cwd(),
    "src",
    "assets",
    "documents",
    "Privacy Policy.md",
  );
  const markdownContent = fs.readFileSync(markdownPath, "utf-8");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex flex-col">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, children, ...props }) => {
                if (props.href === "#cookie-settings") {
                  return <CookieSettingsLink>{children}</CookieSettingsLink>;
                }
                return (
                  <a
                    {...props}
                    className="text-primary hover:underline"
                    target={
                      props.href?.startsWith("http") ? "_blank" : undefined
                    }
                    rel={
                      props.href?.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                  >
                    {children}
                  </a>
                );
              },
              h1: ({ node, ...props }) => (
                <h1 className="text-4xl font-bold mb-4" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-2xl font-semibold mb-4 mt-8" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-xl font-semibold mb-2 mt-4" {...props} />
              ),
              p: ({ node, ...props }) => <p className="mb-4" {...props} />,
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />
              ),
              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
              strong: ({ node, ...props }) => (
                <strong className="font-bold" {...props} />
              ),
              em: ({ node, ...props }) => <em className="italic" {...props} />,
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto mb-4">
                  <table
                    className="min-w-full border-collapse border border-border"
                    {...props}
                  />
                </div>
              ),
              thead: ({ node, ...props }) => (
                <thead className="bg-muted" {...props} />
              ),
              th: ({ node, ...props }) => (
                <th
                  className="border border-border px-4 py-2 text-left font-semibold"
                  {...props}
                />
              ),
              td: ({ node, ...props }) => (
                <td className="border border-border px-4 py-2" {...props} />
              ),
              img: () => null,
            }}
          >
            {markdownContent}
          </ReactMarkdown>
        </div>
      </div>
      <Footer />
    </div>
  );
}
