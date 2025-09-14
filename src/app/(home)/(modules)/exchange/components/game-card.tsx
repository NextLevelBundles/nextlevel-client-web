import { Card, CardContent, CardFooter } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import Image from 'next/image';
import type { ExchangeableSteamKeyDto } from '@/lib/api/types/exchange';

interface GameCardProps {
  game: ExchangeableSteamKeyDto;
  onAction: () => void;
  actionLabel: string;
  actionVariant?: 'default' | 'destructive' | 'outline';
  isLoading?: boolean;
  showCredits?: boolean;
  creditsLabel?: string;
  disabled?: boolean;
}

export function GameCard({
  game,
  onAction,
  actionLabel,
  actionVariant = 'default',
  isLoading = false,
  showCredits = true,
  creditsLabel = 'Credits:',
  disabled = false
}: GameCardProps) {
  const imageUrl = game.steamGameMetadata?.screenshotUrlsJson
    ? JSON.parse(game.steamGameMetadata.screenshotUrlsJson)[0]
    : "/images/hero-background.jpg";

  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        <div className="relative mb-3">
          <Image
            src={imageUrl}
            alt={game.productTitle}
            width={200}
            height={112}
            className="w-full h-28 object-cover rounded-md group-hover:scale-105 transition-transform"
          />
          {game.isFromBundle && (
            <Badge className="absolute top-2 right-2" variant="secondary">
              Bundle
            </Badge>
          )}
        </div>

        <h3 className="font-semibold text-sm mb-1 line-clamp-2">
          {game.productTitle}
        </h3>

        <p className="text-xs text-muted-foreground mb-1">
          {game.publisherName}
        </p>

        <p className="text-xs text-muted-foreground/80 mb-2">
          {game.packageName}
        </p>

        {showCredits && (
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-muted-foreground">{creditsLabel}</span>
            <span className="font-bold text-primary">
              {game.creditsRequired}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 px-4 pb-4">
        <Button
          onClick={onAction}
          disabled={isLoading || disabled}
          variant={actionVariant}
          size="sm"
          className="w-full"
        >
          {isLoading ? 'Processing...' : actionLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}