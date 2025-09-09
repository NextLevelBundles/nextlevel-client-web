
import { getServerSession } from "@/lib/auth/server-auth";
import CartProvider from "../(shared)/contexts/cart/cart-provider";
import { Navigation } from "./components/navigation";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getServerSession();

  return (
    <CartProvider initialCart={null}>
      <Navigation />
      <main className="min-h-screen bg-background relative pt-16">
        <div className="absolute inset-0 bg-mesh opacity-20 dark:opacity-10" />
        {children}
      </main>
    </CartProvider>
  );
}
