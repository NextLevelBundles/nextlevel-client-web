import { Button } from "@/shared/components/ui/button";
import { ArrowRight } from "lucide-react";
import { BundleCard } from "@/home/components/collections/collection-card";
import Link from "next/link";
import { serverApiClient } from "@/lib/server-api";

export async function CurrentBundles() {
  const bundles = await serverApiClient.getBundles();

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
          {/* {bundles.map((bundle) => (
            <div key={bundle.id} className="relative">
              <div
                className={`absolute -inset-1 rounded-2xl bg-linear-to-r ${
                  bundle.tag === "Most Popular"
                    ? "from-primary/20 to-secondary/20"
                    : bundle.tag === "New Release"
                      ? "from-secondary/20 to-primary/20"
                      : bundle.tag === "Last Chance"
                        ? "from-destructive/20 to-primary/20"
                        : bundle.tag === "Best Value"
                          ? "from-[#22c55e]/20 to-secondary/20"
                          : bundle.tag === "Staff Pick"
                            ? "from-[#a855f7]/20 to-primary/20"
                            : "from-primary/20 to-secondary/20"
                } blur-xl opacity-30 dark:opacity-40 transition-opacity group-hover:opacity-100`}
              />
              <div
                className={`group relative h-full overflow-hidden rounded-2xl bg-white/80 dark:bg-card/70 backdrop-blur-xs transition-all hover:translate-y-[-4px] hover:shadow-[0_4px_20px_rgba(57,130,245,0.2)] dark:hover:shadow-[0_4px_30px_rgba(57,130,245,0.3)] border border-white/20 dark:border-border hover:border-primary/50 cursor-pointer animate-fade-up opacity-0 will-change-transform ring-1 ring-black/5 dark:ring-white/20 before:absolute before:inset-[1px] before:rounded-xl before:border before:border-black/[0.03] dark:before:border-white/[0.03] before:pointer-events-none ${bundle.neonClass}`}
              >
                <Card className="border-0 bg-transparent h-full">
                  <Link
                    href={`/collections/${bundle.slug}`}
                    className="flex h-full flex-col"
                  >
                    <div className="relative">
                      <div className="relative aspect-4/3 overflow-hidden rounded-t-2xl">
                        <Image
                          sizes="500px"
                          quality={80}
                          fill={true}
                          src={bundle.image}
                          alt={bundle.title}
                          className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-110 dark:group-hover:brightness-125 will-change-transform saturate-[1.02] group-hover:saturate-[1.1]"
                        />
                        <div className="absolute inset-0 dark:from-background/95 dark:via-background/50 dark:to-transparent transition-opacity group-hover:opacity-75" />
                      </div>
                      <div
                        className={`absolute right-3 top-3 text-xs font-semibold rounded-full px-2 py-0.5 backdrop-blur-xs transition-transform group-hover:scale-105 ${
                          bundle.tag === "Most Popular"
                            ? "bg-primary/30 text-primary ring-1 ring-primary/50"
                            : bundle.tag === "New Release"
                              ? "bg-secondary/30 text-secondary ring-1 ring-secondary/50"
                              : bundle.tag === "Last Chance"
                                ? "bg-destructive/30 text-destructive ring-1 ring-destructive/50"
                                : bundle.tag === "Best Value"
                                  ? "bg-[#22c55e]/30 text-[#22c55e] ring-1 ring-[#22c55e]/50"
                                  : bundle.tag === "Staff Pick"
                                    ? "bg-[#a855f7]/30 text-[#a855f7] ring-1 ring-[#a855f7]/50"
                                    : "bg-muted/30 text-muted-foreground ring-1 ring-white/30"
                        }`}
                      >
                        {bundle.tag}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="mb-2 text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                        {bundle.title}
                      </h3>
                      <div className="mb-4 grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Timer className="h-4 w-4" />
                          <span>{bundle.timeLeft}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{bundle.keysLeft} keys left</span>
                        </div>
                      </div>
                      <div className="mt-auto flex items-end justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Starting at
                          </p>
                          <p className="text-2xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                            ${bundle.minPrice}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          className="relative z-10 transition-all hover:bg-primary hover:text-white border-primary/50 hover:border-primary hover:shadow-[0_0_20px_rgba(57,130,245,0.5)] hover:brightness-110 duration-300"
                        >
                          View Bundle
                        </Button>
                      </div>
                    </div>
                  </Link>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-primary/50 via-secondary/50 to-primary/50 opacity-0 transition-all duration-300 group-hover:opacity-100" />
                </Card>
              </div>
            </div>
          ))} */}
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
