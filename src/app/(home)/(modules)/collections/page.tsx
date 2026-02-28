import { Navigation } from "@/home/components/navigation";
import { BundlesGrid } from "@/home/components/collections/collections-grid";
import { BundleError } from "@/home/components/collections/collection-error";
import { Footer } from "@/home/components/sections/footer";
import { serverApiClient } from "@/lib/server-api";
import { BundleListItem } from "@/app/(shared)/types/bundle";
import type { Metadata } from "next";

// Use revalidation instead of force-dynamic to ensure metadata is in HTML
export const revalidate = 60; // Revalidate every 60 seconds

export const metadata: Metadata = {
  title: "All Collections | Digiphile",
  description:
    "Browse all available gaming collections on Digiphile. Discover curated Steam game collections that support indie developers and charities.",
  keywords: "steam game collections, gaming deals, indie games, charity gaming",
  openGraph: {
    title: "All Collections | Digiphile",
    description:
      "Browse all available gaming collections on Digiphile. Discover curated Steam game collections that support indie developers and charities.",
    url: "https://digiphile.co/collections",
    siteName: "Digiphile",
    images: [
      {
        url: "https://static.digiphile.co/digiphile-social-v2.jpg",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Collections | Digiphile",
    description:
      "Browse all available gaming collections on Digiphile. Discover curated Steam game collections that support indie developers and charities.",
    images: ["https://static.digiphile.co/digiphile-social-v2.jpg"],
  },
};

export default async function BundlesPage() {
  let bundles: BundleListItem[] = [];
  let error = null;

  try {
    bundles = await serverApiClient.getBundles(true);
  } catch (err: any) {
    console.error("Error fetching bundles:", err);
    error = err;
  }

  return (
    <>
      <Navigation />
      {error ? (
        <BundleError error={error} />
      ) : (
        <BundlesGrid bundles={bundles} />
      )}
      <Footer />
    </>
  );
}
