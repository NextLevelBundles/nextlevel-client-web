import { auth } from "@/auth";
import { redirect, RedirectType } from "next/navigation";
import { OnboardingForm } from "./components/onboarding-form";
import { Navigation } from "./components/navigation";

export default async function Onboarding() {
  const session = await auth();

  const groups = session?.["cognito:groups"] || [];
  const customerId = session?.["custom:customerId"];

  if (customerId && groups.includes("Customer")) {
    redirect("/", RedirectType.replace);
  }

  return (
    <main className="min-h-screen bg-background relative">
      <Navigation />

      <div className="absolute inset-0 bg-mesh opacity-20 dark:opacity-10" />
      <div className="pt-24 pb-12">
        <OnboardingForm />
      </div>
    </main>
  );
}
