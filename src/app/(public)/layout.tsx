import Link from "next/link";
import { PublicNavigation } from "./components/navigation";
import CartProvider from "@/app/(shared)/contexts/cart/cart-provider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider initialCart={null}>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <PublicNavigation />

        {/* Main Content */}
        <main className="flex-1 flex items-center">{children}</main>

        {/* Footer */}
        <footer className="mt-auto border-t bg-card/50 py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Digiphile. All rights reserved.
              </p>
              <div className="flex gap-6">
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Terms
                </Link>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Privacy
                </Link>
                <Link
                  href="/support"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Support
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}
