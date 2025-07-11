import { Session } from "next-auth";
import { redirect, RedirectType } from "next/navigation";

export default async function requireOnboarding(
  session: Session | null
): Promise<void> {
  const groups = session?.["cognito:groups"] || [];
  const customerId = session?.["custom:customerId"];

  if (session && (!customerId || !groups.includes("Customer"))) {
    redirect("/onboarding", RedirectType.push);
  }
}
