import { getServerSession } from "@/lib/auth/server-auth";
import CartProvider from "../(shared)/contexts/cart/cart-provider";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getServerSession();

  return (
    <main className="min-h-screen bg-background relative">
      <div className="absolute inset-0 bg-mesh opacity-20 dark:opacity-10" />
      <CartProvider initialCart={null}>{children}</CartProvider>
    </main>
  );
}
