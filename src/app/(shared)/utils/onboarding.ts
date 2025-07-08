import { auth } from "@/auth";
import { redirect, RedirectType } from "next/navigation";

export default async function requireOnboarding(): Promise<void> {
  const session = await auth();
  const groups = session?.["cognito:groups"] || [];
  const customerId = session?.["custom:customerId"];

  if (session && (!customerId || !groups.includes("Customer"))) {
    redirect("/onboarding", RedirectType.push);
  }
}
