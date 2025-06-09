"use server";

import { Navigation } from "@/home/components/navigation";
import { BundlesGrid } from "@/home/components/bundles/bundles-grid";
import { Footer } from "@/home/components/sections/footer";
import { Bundle } from "@/app/(shared)/types/bundle";

export default async function BundlesPage() {
  const response = await fetch(`${process.env.API_URL}/customer/bundles`);
  const bundles = await response.json();
  const bundlesTyped = bundles as Bundle[];

  return (
    <main className="min-h-screen bg-background relative">
      <div className="absolute inset-0 bg-mesh opacity-20 dark:opacity-10" />
      <Navigation />
      <div className="pt-24 pb-12">
        <BundlesGrid bundles={bundlesTyped} />
      </div>
      <Footer />
    </main>
  );
}
