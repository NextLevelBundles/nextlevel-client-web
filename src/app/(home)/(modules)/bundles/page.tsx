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
    <>
      <Navigation />
      <BundlesGrid bundles={bundlesTyped} />
      <Footer />
    </>
  );
}
