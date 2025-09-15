import { Card, CardContent, CardFooter } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import type { ExchangeableSteamKeyDto } from '@/lib/api/types/exchange';
import { GameImageDeck } from './game-image-deck';

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
  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardContent className="p-2">
        <div className="relative mb-2">
          <GameImageDeck
            coverImage={game.coverImage}
            screenshotUrlsJson={game.steamGameMetadata?.screenshotUrlsJson}
            title={game.productTitle}
            className="group-hover:scale-105 transition-transform"
          />
          {game.isFromBundle && (
            <Badge className="absolute top-1 right-1 text-xs px-1 py-0" variant="secondary">
              Bundle
            </Badge>
          )}
        </div>

        <h3 className="font-medium text-xs mb-1 line-clamp-2 leading-tight">
          {game.productTitle}
        </h3>

        <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
          {game.publisherName}
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

      <CardFooter className="pt-0 px-2 pb-2">
        <Button
          onClick={onAction}
          disabled={isLoading || disabled}
          variant={actionVariant}
          size="xs"
          className="w-full text-xs h-7"
        >
          {isLoading ? 'Processing...' : actionLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}