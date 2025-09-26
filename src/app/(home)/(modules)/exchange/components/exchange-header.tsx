'use client';

import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { HistoryIcon } from "lucide-react";
import Link from 'next/link';
import { UserCredits } from '@/shared/components/user-credits';

export function ExchangeHeader() {
  return (
    <div className="space-y-6 mb-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Digiphile Exchange</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Transform your credits and unlock premium titles from our marketplace.
        </p>
      </div>

      <Card className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-primary/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <UserCredits />

          <Button asChild variant="outline" size="sm">
            <Link href="/customer/exchange-history" className="flex items-center gap-2">
              <HistoryIcon className="h-4 w-4" />
              Exchange History
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}