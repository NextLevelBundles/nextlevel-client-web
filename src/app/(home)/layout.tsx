import { getServerSession } from "@/lib/auth/server-auth";
import CartProvider from "../(shared)/contexts/cart/cart-provider";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  console.log("Auth Layout - Server Session:", session);

  return (
    <main className="min-h-screen bg-background relative">
      {/* <Navigation /> */}

      <div className="absolute inset-0 bg-mesh opacity-20 dark:opacity-10 pointer-events-none" />
      <CartProvider initialCart={null}>{children}</CartProvider>
    </main>
  );
}
