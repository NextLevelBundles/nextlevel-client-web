import { Navigation } from "@/home/components/navigation";
import { Footer } from "@/home/components/sections/footer";
import { serverApiClient } from "@/lib/server-api";
import { ExchangeGameContent } from "./exchange-game-content";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// Use revalidation instead of force-dynamic to ensure metadata is in HTML
export const revalidate = 60; // Revalidate every 60 seconds

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const game = await serverApiClient.getExchangeGameDetails(id);

    if (!game) {
      return {
        title: "Game Not Found | Digiphile Exchange",
        description:
          "The exchange game you are looking for could not be found.",
      };
    }

    return {
      title: `${game.title} - Exchange | Digiphile`,
      description: `Trade your credits for ${game.title}. ${"Available now on the Digiphile Exchange."}`,
      openGraph: {
        title: `${game.title} - Exchange | Digiphile`,
        description: `Trade your credits for ${game.title}. ${"Available now on the Digiphile Exchange."}`,
        images: [
          {
            url:
              game.steamApp.headerImage ||
              game.coverImage.url ||
              "https://static.digiphile.co/digiphile-social.jpg",
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${game.title} - Exchange | Digiphile`,
        description: `Trade your credits for ${game.title}. "Available now on the Digiphile Exchange."}`,
        images: [
          game.steamApp.headerImage ||
            game.coverImage.url ||
            "https://static.digiphile.co/digiphile-social.jpg",
        ],
      },
    };
  } catch {
    return {
      title: "Game Not Found | Digiphile Exchange",
      description: "The exchange game you are looking for could not be found.",
    };
  }
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
            <p className="text-muted-foreground">
              Failed to load game details. Please try again later.
            </p>
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
