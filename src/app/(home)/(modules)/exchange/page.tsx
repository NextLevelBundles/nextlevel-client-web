"use client";

import { Navigation } from "@/home/components/navigation";
import { Footer } from "@/home/components/sections/footer";
import { ExchangeHeader } from "./components/exchange-header";
import { ExchangeSection } from "./components/exchange-section";
import { useExchangeData, useExchangeCreditsForKey } from "@/hooks/queries/use-exchange";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function ExchangePage() {
  const { data, isLoading, error } = useExchangeData();
  const exchangeCreditsForKeyMutation = useExchangeCreditsForKey();

  const handleExchangeCreditsForKey = (keyId: string) => {
    exchangeCreditsForKeyMutation.mutate(keyId);
  };

  if (error) {
    return (
      <>
        <Navigation />
        <main className="max-w-[1600px] mx-auto pt-24 pb-8 px-6 md:px-12 lg:px-20 xl:px-32 min-h-screen">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load exchange data. Please refresh the page or try again later.
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="max-w-[1600px] mx-auto pt-24 pb-8 px-6 md:px-12 lg:px-20 xl:px-32 min-h-screen">
        <ExchangeHeader credits={data?.credits ?? 0} isLoading={isLoading} />

        <ExchangeSection
          exchangeableKeys={data?.exchangeableKeys ?? []}
          isLoading={isLoading}
          onExchange={handleExchangeCreditsForKey}
          isExchanging={exchangeCreditsForKeyMutation.isPending}
          userCredits={data?.credits ?? 0}
        />
      </main>
      <Footer />
    </>
  );
}