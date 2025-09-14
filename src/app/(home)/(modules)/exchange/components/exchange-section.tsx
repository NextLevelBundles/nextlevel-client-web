import Image from 'next/image';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { GameCard } from './game-card';
import type { ExchangeableSteamKeyDto } from '@/lib/api/types/exchange';

interface ExchangeSectionProps {
  exchangeableKeys: ExchangeableSteamKeyDto[];
  isLoading: boolean;
  onExchange: (keyId: string) => void;
  isExchanging: boolean;
  userCredits: number;
}

function ExchangeSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <Skeleton className="w-full h-28 rounded-md" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyExchange() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">    
      <div className="text-center space-y-2">
        <h3 className="font-medium text-muted-foreground">No games available for exchange</h3>
        <p className="text-sm text-muted-foreground/80">
          Check back later for new games to exchange your credits for
        </p>
      </div>
    </div>
  );
}

export function ExchangeSection({
  exchangeableKeys,
  isLoading,
  onExchange,
  isExchanging,
  userCredits
}: ExchangeSectionProps) {
  return (
    <section className="bg-card rounded-lg border shadow-sm p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Use Credits for Games</h2>
          <span className="text-sm text-muted-foreground">
            {exchangeableKeys.length} {exchangeableKeys.length === 1 ? 'game' : 'games'} available
          </span>
        </div>

        {isLoading ? (
          <ExchangeSkeleton />
        ) : exchangeableKeys.length === 0 ? (
          <EmptyExchange />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exchangeableKeys.map((key) => {
              const canAfford = userCredits >= key.creditsRequired;
              return (
                <GameCard
                  key={key.id}
                  game={key}
                  onAction={() => onExchange(key.id)}
                  actionLabel={canAfford ? 'Exchange' : `Need ${key.creditsRequired - userCredits} more credits`}
                  actionVariant={canAfford ? 'default' : 'outline'}
                  isLoading={isExchanging}
                  showCredits={true}
                  creditsLabel="Cost:"
                  disabled={!canAfford}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}