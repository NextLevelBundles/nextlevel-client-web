"use client";

import { Navigation } from "@/home/components/navigation";
import { BundlesGrid } from "@/home/components/bundles/bundles-grid";
import { Footer } from "@/home/components/sections/footer";

export default function BundlesPage() {
  return (
    <main className="min-h-screen bg-background relative">
      <div className="absolute inset-0 bg-mesh opacity-20 dark:opacity-10" />
      <Navigation />
      <div className="pt-24 pb-12">
        <BundlesGrid />
      </div>
      <Footer />
    </main>
  );
}
