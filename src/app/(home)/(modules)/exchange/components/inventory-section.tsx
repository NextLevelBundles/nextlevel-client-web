import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { GameCard } from './game-card';
import type { ExchangeableSteamKeyDto } from '@/lib/api/types/exchange';

interface InventorySectionProps {
  inventoryKeys: ExchangeableSteamKeyDto[];
  isLoading: boolean;
  onExchange: (keyId: string) => void;
  isExchanging: boolean;
}

function InventorySkeleton() {
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

function EmptyInventory() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
      <Image
        src="/images/hero-background.jpg"
        alt="No games"
        width={96}
        height={96}
        className="w-24 h-24 opacity-40 rounded-lg"
      />
      <div className="text-center space-y-2">
        <h3 className="font-medium text-muted-foreground">No games in inventory</h3>
        <p className="text-sm text-muted-foreground/80">
          Purchase bundles to add games to your inventory
        </p>
      </div>
      <Link
        href="/bundles"
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        Browse Bundles
      </Link>
    </div>
  );
}

export function InventorySection({
  inventoryKeys,
  isLoading,
  onExchange,
  isExchanging
}: InventorySectionProps) {
  return (
    <section className="bg-card rounded-lg border shadow-sm p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Inventory</h2>
          <span className="text-sm text-muted-foreground">
            {inventoryKeys.length} {inventoryKeys.length === 1 ? 'game' : 'games'}
          </span>
        </div>

        {isLoading ? (
          <InventorySkeleton />
        ) : inventoryKeys.length === 0 ? (
          <EmptyInventory />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventoryKeys.map((key) => (
              <GameCard
                key={key.id}
                game={key}
                onAction={() => onExchange(key.id)}
                actionLabel="Send to Exchange"
                actionVariant="default"
                isLoading={isExchanging}
                showCredits={true}
                creditsLabel="You will get:"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}