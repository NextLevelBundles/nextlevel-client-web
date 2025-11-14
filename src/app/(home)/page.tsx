import { Navigation } from "@/home/components/navigation";
import { HeroSection } from "@/home/components/sections/hero";
import { CurrentBundles } from "@/home/components/sections/current-bundles";
import { HowItWorks } from "@/home/components/sections/how-it-works";
import { Newsletter } from "@/home/components/sections/newsletter";
import { Footer } from "@/home/components/sections/footer";
import { serverApiClient } from "@/lib/server-api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const bundles = await serverApiClient.getBundles();
  const hasBundles = bundles && bundles.length > 0;

  return (
    <>
      <Navigation />
      <HeroSection />
      {hasBundles ? (
        <>
          <CurrentBundles />
          <HowItWorks />
          {/* <CharityStats /> */}
          {/* <BadgesPreview /> */}
          {/* <BlogPreview /> */}
          <Newsletter />
        </>
      ) : (
        <>
          <Newsletter showAsFirstCollection={true} />
          <HowItWorks />
          {/* <CharityStats /> */}
          {/* <BadgesPreview /> */}
          {/* <BlogPreview /> */}
        </>
      )}
      <Footer />
    </>
  );
}
