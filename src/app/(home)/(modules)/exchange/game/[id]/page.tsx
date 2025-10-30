import { Navigation } from "@/home/components/navigation";
import { Footer } from "@/home/components/sections/footer";
import { serverApiClient } from "@/lib/server-api";
import { ExchangeGameContent } from "./exchange-game-content";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExchangeGameDetailsPage({ params }: PageProps) {
  const { id } = await params;

  let game = null;
  let error = null;

  try {
    game = await serverApiClient.getExchangeGameDetails(id);

    if (!game) {
      notFound();
    }
  } catch (err) {
    console.error("Error fetching exchange game details:", err);
    // Check if it's a 404 error
    if (err instanceof Error && err.message.includes("404")) {
      notFound();
    }
    error = err;
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Something went wrong</h2>
            <p className="text-muted-foreground">Failed to load game details. Please try again later.</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background pt-16">
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <ExchangeGameContent game={game!} />
        </div>
      </div>
      <Footer />
    </>
  );
}