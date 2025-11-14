import { getServerSession } from "@/lib/auth/server-auth";
import CartProvider from "../(shared)/contexts/cart/cart-provider";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digiphile - Expert-Curated Game & Book Collections",
  description:
    "Expert-curated, premium game and book collections from Humble Bundle vets offering discovery options for digital media enthusiasts like the Games Exchange.",
  openGraph: {
    title: "Digiphile - Expert-Curated Game & Book Collections",
    description:
      "Expert-curated, premium game and book collections from Humble Bundle vets offering discovery options for digital media enthusiasts like the Games Exchange.",
    url: "https://digiphile.co",
    siteName: "Digiphile",
    images: [
      {
        url: "https://static.digiphile.co/digiphile-social.jpg",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Digiphile - Expert-Curated Game & Book Collections",
    description:
      "Expert-curated, premium game and book collections from Humble Bundle vets offering discovery options for digital media enthusiasts like the Games Exchange.",
    images: ["https://static.digiphile.co/digiphile-social.jpg"],
  },
};

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
