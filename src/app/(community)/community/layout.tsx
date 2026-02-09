import CartProvider from "@/app/(shared)/contexts/cart/cart-provider";
import { CartDrawerProvider } from "@/app/(home)/components/cart/cart-drawer-context";
import { CommunityNavigation } from "./components/navigation";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider initialCart={null}>
      <CartDrawerProvider>
        <main className="min-h-screen bg-background relative">
          <div className="absolute inset-0 bg-mesh opacity-20 dark:opacity-10 pointer-events-none" />
          <CommunityNavigation />
          <div className="container px-4 pt-24 pb-12 relative">{children}</div>
        </main>
      </CartDrawerProvider>
    </CartProvider>
  );
}
