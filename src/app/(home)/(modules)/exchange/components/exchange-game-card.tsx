"use client";

import { ExchangeGame } from "@/lib/api/types/exchange-game";
import { Badge } from "@/app/(shared)/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Gamepad2 } from "lucide-react";
import { Card } from "@/app/(shared)/components/ui/card";

interface ExchangeGameCardProps {
  game: ExchangeGame;
}

export function ExchangeGameCard({ game }: ExchangeGameCardProps) {
  return (
    <Link href={`/exchange/game/${game.id}`} className="block">
      <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/50 cursor-pointer">
        {/* 2:3 Cover Image */}
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-purple-500/10 to-blue-500/10" style={{ aspectRatio: "2/3" }}>
          {game.coverImage?.url ? (
            <>
              <Image
                src={game.coverImage.url}
                alt={game.title}
                fill
                className="object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Gamepad2 className="w-12 h-12 text-white/30" />
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
              <ArrowRight className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Title */}
          <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {game.title}
          </h3>

          {/* Credits Section */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Exchange Rate
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{game.outputCredits}</span>
                <span className="text-sm text-muted-foreground">credits</span>
              </div>
            </div>
          </div>

          {/* View Details Text */}
          <div className="flex items-center justify-center py-3 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
            <span className="text-sm font-medium text-primary">
              View Details
            </span>
            <ArrowRight className="w-4 h-4 ml-2 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
