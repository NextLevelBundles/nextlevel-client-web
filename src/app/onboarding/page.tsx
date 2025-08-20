import { getServerSession } from "@/lib/auth/server-auth";
import { redirect, RedirectType } from "next/navigation";
import { OnboardingForm } from "./components/onboarding-form";
import { Navigation } from "./components/navigation";

export default async function Onboarding() {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/signin", RedirectType.replace);
  }

  // Check if user already has a customerId (completed profile)
  // This is handled by middleware, but we can add a server-side check as well
  const customerId = session.customClaims?.['custom:customerId'];
  if (customerId) {
    redirect("/customer", RedirectType.replace);
  }

  return (
    <main className="min-h-screen bg-background relative">
      <Navigation />

      <div className="absolute inset-0 bg-mesh opacity-20 dark:opacity-10" />
      <div className="pt-24 pb-12 h-full">
        <OnboardingForm />
      </div>
    </main>
  );
}
