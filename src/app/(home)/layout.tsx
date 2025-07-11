import requireOnboarding from "@/shared/utils/onboarding";
import { CartProviderWrapper } from "../(shared)/contexts/cart/cart-provider-wrapper";
import { auth } from "@/auth";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  await requireOnboarding(session);

  return (
    <main className="min-h-screen bg-background relative">
      <div className="absolute inset-0 bg-mesh opacity-20 dark:opacity-10" />
      <CartProviderWrapper>{children}</CartProviderWrapper>
    </main>
  );
}
