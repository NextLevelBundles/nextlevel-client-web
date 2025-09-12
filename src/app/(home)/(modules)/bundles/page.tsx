import { Navigation } from "@/home/components/navigation";
import { BundlesGrid } from "@/home/components/bundles/bundles-grid";
import { BundleError } from "@/home/components/bundles/bundle-error";
import { Footer } from "@/home/components/sections/footer";
import { serverApiClient } from "@/lib/server-api";
import { BundleListItem } from "@/app/(shared)/types/bundle";

export const dynamic = 'force-dynamic';

export default async function BundlesPage() {
  let bundles: BundleListItem[] = [];
  let error = null;

  try {
    bundles = await serverApiClient.getBundles();
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