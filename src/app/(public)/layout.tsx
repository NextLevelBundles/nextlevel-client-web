import { Inter } from "next/font/google";
import Link from "next/link";
import { Toaster } from "sonner";
import { PublicNavigation } from "./components/navigation";
import { CartProviderWrapper } from "@/app/(shared)/contexts/cart/cart-provider-wrapper";
import { auth } from "@/auth";

const inter = Inter({ subsets: ["latin"] });

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProviderWrapper session={session}>
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
          <Toaster richColors position="top-center" />
        </CartProviderWrapper>
      </body>
    </html>
  );
}
