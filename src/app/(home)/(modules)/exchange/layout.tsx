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
        url: "http://static.digiphile.co/digiphile-social.jpg",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Exchange - Trade Games for Credits | Digiphile",
    description:
      "Trade in games you already own from our collections for credits. Use your credits to discover new titles from the Exchange.",
    images: ["http://static.digiphile.co/digiphile-social.jpg"],
  },
};

export default function ExchangeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
