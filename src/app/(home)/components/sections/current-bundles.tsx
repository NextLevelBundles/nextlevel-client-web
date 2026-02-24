import { Button } from "@/shared/components/ui/button";
import { ArrowRight } from "lucide-react";
import { BundleCard } from "@/home/components/collections/collection-card";
import Link from "next/link";
import { serverApiClient } from "@/lib/server-api";

export async function CurrentBundles() {
  const bundles = await serverApiClient.getBundles(false);

  // Don't render this section if there are no bundles
  if (!bundles || bundles.length === 0) {
    return null;
  }

  return (
    <section className="relative py-24 px-6 md:px-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,130,245,0.15),transparent_70%),radial-gradient(ellipse_at_bottom,rgba(249,113,20,0.1),transparent_70%)] opacity-30 dark:opacity-40" />
      <div className="container relative px-4 mx-auto overflow-visible">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl bg-linear-to-r from-primary via-foreground to-secondary bg-clip-text text-transparent animate-glow">
            Current Offers
          </h2>
          <p className="text-muted-foreground">
            Choose from our meticulously curated collections
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map((bundle, index) => (
            <BundleCard key={bundle.id} bundle={bundle} index={index} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/collections"
            className="inline-flex items-center cursor-pointer"
          >
            <Button
              variant="outline"
              size="lg"
              type="button"
              className="bg-card/50 backdrop-blur-xs hover:bg-primary/20 cursor-pointer transition-all hover:shadow-[0_0_30px_rgba(57,130,245,0.2)] ring-1 ring-white/20"
            >
              View All Collections
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
