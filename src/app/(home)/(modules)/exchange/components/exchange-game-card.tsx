'use client';

import { ExchangeGame } from '@/lib/api/types/exchange-game';
import { Button } from '@/app/(shared)/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

interface ExchangeGameCardProps {
  game: ExchangeGame;
}

export function ExchangeGameCard({ game }: ExchangeGameCardProps) {
  return (
    <div className="group relative bg-card rounded-lg overflow-hidden border transition-all hover:shadow-lg">
      {/* 16:9 Header Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {game.steamApp.headerImage ? (
          <Image
            src={game.steamApp.headerImage}
            alt={game.steamApp.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No image available
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <h3 className="font-semibold text-lg line-clamp-2">
          {game.steamApp.name}
        </h3>

        {/* Credits */}
        <div>
          <p className="text-sm text-muted-foreground">Required Credits</p>
          <p className="text-xl font-bold">{game.inputCredits}</p>
        </div>

        {/* CTA Button */}
        <Link href={`/exchange/game/${game.id}`} className="block">
          <Button className="w-full">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
}