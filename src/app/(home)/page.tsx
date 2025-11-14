import { Navigation } from "@/home/components/navigation";
import { HeroSection } from "@/home/components/sections/hero";
import { CurrentBundles } from "@/home/components/sections/current-bundles";
import { HowItWorks } from "@/home/components/sections/how-it-works";
import { Newsletter } from "@/home/components/sections/newsletter";
import { Footer } from "@/home/components/sections/footer";
import { serverApiClient } from "@/lib/server-api";
import type { Metadata } from "next";

// Use revalidation instead of force-dynamic to ensure metadata is in HTML
// export const revalidate = 60; // Revalidate every 60 seconds

export const metadata: Metadata = {
  title: "Digiphile - Expert-Curated Game & Book Collections",
  description:
    "Expert-curated, premium game and book collections from Humble Bundle vets offering discovery options for digital media enthusiasts like the Games Exchange.",
  openGraph: {
    title: "Digiphile - Expert-Curated Game & Book Collections",
    description:
      "Expert-curated, premium game and book collections from Humble Bundle vets offering discovery options for digital media enthusiasts like the Games Exchange.",
    url: "https://digiphile.co",
    siteName: "Digiphile",
    images: [
      {
        url: "https://static.digiphile.co/digiphile-social.jpg",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Digiphile - Expert-Curated Game & Book Collections",
    description:
      "Expert-curated, premium game and book collections from Humble Bundle vets offering discovery options for digital media enthusiasts like the Games Exchange.",
    images: ["https://static.digiphile.co/digiphile-social.jpg"],
  },
};

export default async function Home() {
  const bundles = await serverApiClient.getBundles();
  const hasBundles = bundles && bundles.length > 0;

  return (
    <>
      <Navigation />
      <HeroSection />
      {hasBundles ? (
        <>
          <CurrentBundles />
          <HowItWorks />
          {/* <CharityStats /> */}
          {/* <BadgesPreview /> */}
          {/* <BlogPreview /> */}
          <Newsletter />
        </>
      ) : (
        <>
          <Newsletter showAsFirstCollection={true} />
          <HowItWorks />
          {/* <CharityStats /> */}
          {/* <BadgesPreview /> */}
          {/* <BlogPreview /> */}
        </>
      )}
      <Footer />
    </>
  );
}
