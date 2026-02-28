import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support | Digiphile",
  description:
    "Get help with your Digiphile account, purchases, and game keys. Contact our support team for assistance.",
  openGraph: {
    title: "Support | Digiphile",
    description:
      "Get help with your Digiphile account, purchases, and game keys. Contact our support team for assistance.",
    images: [
      {
        url: "https://static.digiphile.co/digiphile-social-v2.jpg",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Support | Digiphile",
    description:
      "Get help with your Digiphile account, purchases, and game keys. Contact our support team for assistance.",
    images: ["https://static.digiphile.co/digiphile-social-v2.jpg"],
  },
};

export default function SupportPage() {
  redirect("https://sites.google.com/digiphile.co/help/contact-us");
}
