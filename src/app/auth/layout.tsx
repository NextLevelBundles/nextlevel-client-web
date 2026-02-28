import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Digiphile",
  description:
    "Sign in to your Digiphile account to access your game library, manage purchases, and discover new curated collections.",
  openGraph: {
    title: "Sign In | Digiphile",
    description:
      "Sign in to your Digiphile account to access your game library, manage purchases, and discover new curated collections.",
    images: [
      {
        url: "https://static.digiphile.co/digiphile-social-v2.jpg",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In | Digiphile",
    description:
      "Sign in to your Digiphile account to access your game library, manage purchases, and discover new curated collections.",
    images: ["https://static.digiphile.co/digiphile-social-v2.jpg"],
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
