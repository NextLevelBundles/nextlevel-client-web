/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { Navigation } from "@/home/components/navigation";
import { BundleDetail } from "@/home/components/bundles/bundle-detail";
import { Footer } from "@/home/components/sections/footer";
import { Bundle } from "@/app/(shared)/types/bundle";

export default async function BundleDetailPage({ params }: { params: any }) {
  const { id } = await params;

  const response = await fetch(`${process.env.API_URL}/customer/bundles/${id}`);
  const bundle = await response.json();
  const bundleTyped = bundle as Bundle;

  return (
    <main className="min-h-screen bg-background relative">
      <div className="absolute inset-0 bg-mesh opacity-20 dark:opacity-10" />
      <Navigation />
      <div className="pt-16">
        <BundleDetail bundle={bundleTyped} />
      </div>
      <Footer />
    </main>
  );
}
