"use client";

import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

const posts = [
  {
    title: "The Rise of Indie Game Bundles",
    excerpt:
      "How digital distribution is changing the game industry and empowering independent developers.",
    image:
      "https://images.unsplash.com/photo-1556438064-2d7646166914?q=80&w=2940&auto=format&fit=crop",
    date: "Mar 15, 2024",
    readTime: "5 min read",
  },
  {
    title: "Supporting Charities Through Gaming",
    excerpt:
      "Exploring how gamers are making a real-world impact through charitable gaming initiatives.",
    image:
      "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?q=80&w=2940&auto=format&fit=crop",
    date: "Mar 12, 2024",
    readTime: "4 min read",
  },
  {
    title: "Next-Gen Game Development",
    excerpt:
      "The latest tools and technologies shaping the future of game development.",
    image:
      "https://images.unsplash.com/photo-1519669556878-63bdad8a1a49?q=80&w=2941&auto=format&fit=crop",
    date: "Mar 10, 2024",
    readTime: "6 min read",
  },
];

export function BlogPreview() {
  return (
    <section className="py-24 mt-12 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,130,245,0.15),transparent_70%),radial-gradient(ellipse_at_bottom,rgba(249,113,20,0.1),transparent_70%)] opacity-30 dark:opacity-40" />
      <div className="container px-4">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl text-[#1c1c1e] dark:text-foreground">
              Latest News
            </h2>
            <p className="text-[#4b5563] dark:text-muted-foreground">
              Updates from the gaming world and our community
            </p>
          </div>
          <Button
            variant="outline"
            className="hidden sm:inline-flex hover:bg-primary/10 hover:text-primary transition-all duration-300 border-white/20 dark:border-border hover:border-primary/50"
          >
            View All Posts <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden border border-white/20 dark:border-border bg-white/80 dark:bg-card/90 backdrop-blur-sm transform transition-all duration-300 hover:translate-y-[-4px] hover:bg-white/95 dark:hover:bg-card/95 hover:shadow-[0_4px_20px_rgba(57,130,245,0.2)] dark:hover:shadow-[0_4px_30px_rgba(57,130,245,0.3)] hover:border-primary/50 dark:hover:ring-1 dark:hover:ring-primary/30 will-change-transform rounded-xl ring-1 ring-black/5 dark:ring-white/20 before:absolute before:inset-[1px] before:rounded-xl before:border before:border-black/[0.03] dark:before:border-white/[0.03] before:pointer-events-none"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={post.image}
                  fill={true}
                  sizes="(max-width: 768px) 100vw, (min-width: 768px) 50vw"
                  alt={post.title}
                  className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-110 dark:group-hover:brightness-125 will-change-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent dark:from-background/80 dark:via-background/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-6">
                <div className="mb-4 flex items-center gap-4 text-sm text-[#64748b] dark:text-muted-foreground">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#1c1c1e] dark:text-foreground group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="mb-4 text-sm text-[#4b5563] dark:text-muted-foreground line-clamp-3">
                  {post.excerpt}
                </p>
                <Button
                  variant="ghost"
                  className="p-0 hover:bg-transparent hover:text-primary hover:shadow-[0_0_15px_rgba(57,130,245,0.3)] dark:hover:shadow-[0_0_20px_rgba(57,130,245,0.5)] transition-all duration-300"
                >
                  Read More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Button
            variant="outline"
            className="hover:bg-primary/10 hover:text-primary transition-all duration-300 border-white/20 dark:border-border hover:border-primary/50"
          >
            View All Posts <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
