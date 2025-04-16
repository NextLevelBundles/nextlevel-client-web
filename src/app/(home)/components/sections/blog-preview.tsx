"use client";

import { Card } from "@/app/(shared)/components/ui/card";
import { Button } from "@/app/(shared)/components/ui/button";
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,130,245,0.1),transparent_80%)]" />
      <div className="container px-4">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="font-orbitron mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Latest News
            </h2>
            <p className="text-muted-foreground">
              Updates from the gaming world and our community
            </p>
          </div>
          <Button variant="outline" className="hidden sm:inline-flex">
            View All Posts <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <Card
              key={index}
              className="group overflow-hidden border-0 bg-card/90 backdrop-blur-xs transform transition-all duration-300 hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-primary/20 ring-1 ring-white/10 will-change-transform"
            >
              <div className="aspect-16/9 overflow-hidden relative">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill={true}
                  className="h-full w-full object-cover transition-all duration-300 group-hover:brightness-110 group-hover:scale-105 will-change-transform"
                />
              </div>
              <div className="p-6">
                <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="font-rajdhani mb-2 text-xl font-semibold">
                  {post.title}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
                  {post.excerpt}
                </p>
                <Button
                  variant="ghost"
                  className="p-0 hover:bg-transparent hover:text-primary hover:shadow-[0_0_20px_rgba(57,130,245,0.5)] transition-all duration-300"
                >
                  Read More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline">
            View All Posts <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
