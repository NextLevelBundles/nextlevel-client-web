import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Exchange - Trade Games for Credits | Digiphile",
  description:
    "Trade in games you already own from our collections for credits. Use your credits to discover new titles from the Exchange.",
  openGraph: {
    title: "The Exchange - Trade Games for Credits | Digiphile",
    description:
      "Trade in games you already own from our collections for credits. Use your credits to discover new titles from the Exchange.",
    images: [
      {
        url: "https://static.digiphile.co/digiphile-social-v2.jpg",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Exchange - Trade Games for Credits | Digiphile",
    description:
      "Trade in games you already own from our collections for credits. Use your credits to discover new titles from the Exchange.",
    images: ["https://static.digiphile.co/digiphile-social-v2.jpg"],
  },
};

export default function ExchangeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
