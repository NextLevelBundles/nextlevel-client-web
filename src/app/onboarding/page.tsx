import { getServerSession } from "@/lib/auth/server-auth";
import { redirect, RedirectType } from "next/navigation";
import { OnboardingForm } from "./components/onboarding-form";
import { Navigation } from "./components/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Your Profile | Digiphile",
  description:
    "Complete your Digiphile profile to get started with your digital game library and exclusive bundles.",
  openGraph: {
    title: "Complete Your Profile | Digiphile",
    description:
      "Complete your Digiphile profile to get started with your digital game library and exclusive bundles.",
    images: [
      {
        url: "https://static.digiphile.co/digiphile-social.jpg",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Complete Your Profile | Digiphile",
    description:
      "Complete your Digiphile profile to get started with your digital game library and exclusive bundles.",
    images: ["https://static.digiphile.co/digiphile-social.jpg"],
  },
};

export default async function Onboarding() {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/signin", RedirectType.replace);
  }

  // Check if user already has a customerId (completed profile)
  // This is handled by middleware, but we can add a server-side check as well
  const customerId = session.customClaims?.["custom:customerId"];
  if (customerId) {
    redirect("/customer", RedirectType.replace);
  }

  return (
    <main className="min-h-screen bg-background relative">
      <Navigation />

      <div className="absolute inset-0 bg-mesh opacity-20 dark:opacity-10 pointer-events-none" />
      <div className="pt-24 pb-12 h-full">
        <OnboardingForm />
      </div>
    </main>
  );
}
