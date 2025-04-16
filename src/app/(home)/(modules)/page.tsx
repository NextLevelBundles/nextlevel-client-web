import { Navigation } from "@/home/components/navigation";
import { HeroSection } from "@/home/components/sections/hero";
import { CurrentBundles } from "@/home/components/sections/current-bundles";
import { HowItWorks } from "@/home/components/sections/how-it-works";
import { CharityStats } from "@/home/components/sections/charity-stats";
import { BadgesPreview } from "@/home/components/sections/badges-preview";
import { BlogPreview } from "@/home/components/sections/blog-preview";
import { Newsletter } from "@/home/components/sections/newsletter";
import { Footer } from "@/home/components/sections/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative">
      <div className="absolute inset-0 bg-mesh opacity-10" />
      <Navigation />
      <HeroSection />
      <CurrentBundles />
      <HowItWorks />
      <CharityStats />
      <BadgesPreview />
      <BlogPreview />
      <Newsletter />
      <Footer />
    </main>
  );
}
