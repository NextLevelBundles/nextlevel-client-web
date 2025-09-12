import { Navigation } from "@/home/components/navigation";
import { BundlesGrid } from "@/home/components/bundles/bundles-grid";
import { Footer } from "@/home/components/sections/footer";
import { serverApiClient } from "@/lib/server-api";

export const dynamic = 'force-dynamic';

export default async function BundlesPage() {
  const bundles = await serverApiClient.getBundles();

  return (
    <>
      <Navigation />
      <BundlesGrid bundles={bundles} />
      <Footer />
    </>
  );
}