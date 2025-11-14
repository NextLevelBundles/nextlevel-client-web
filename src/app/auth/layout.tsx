import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Digiphile",
  description:
    "Sign in to your Digiphile account to access your game library, manage purchases, and discover new curated bundles.",
  openGraph: {
    title: "Sign In | Digiphile",
    description:
      "Sign in to your Digiphile account to access your game library, manage purchases, and discover new curated bundles.",
    images: [
      {
        url: "http://static.digiphile.co/digiphile-social.jpg",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In | Digiphile",
    description:
      "Sign in to your Digiphile account to access your game library, manage purchases, and discover new curated bundles.",
    images: ["http://static.digiphile.co/digiphile-social.jpg"],
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}