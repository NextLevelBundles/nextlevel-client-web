import { Navigation } from "@/home/components/navigation";
import { BundleDetail } from "@/home/components/bundles/bundle-detail";
import { Footer } from "@/home/components/sections/footer";

export default async function BundleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-background relative">
      <div className="absolute inset-0 bg-mesh opacity-20 dark:opacity-10" />
      <Navigation />
      <div className="pt-16">
        <BundleDetail bundleId={parseInt(id)} />
      </div>
      <Footer />
    </main>
  );
}
