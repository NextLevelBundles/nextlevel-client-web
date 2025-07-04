import "./globals.css";
import type { Metadata } from "next";
import "@fontsource/orbitron/700.css";
import "@fontsource/rajdhani/600.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/app/(shared)/components/theme-provider";
import { SessionProvider } from "next-auth/react";

import { auth } from "@/auth";
import { redirect, RedirectType } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "NextLevel | Gaming Bundles That Make a Difference",
  description:
    "Get amazing game bundles at unbeatable prices while supporting charities. Pay what you want for curated collections of Steam keys.",
  keywords: "game bundles, steam keys, charity gaming, indie games, game deals",
  openGraph: {
    title: "NextLevel Gaming Bundles",
    description:
      "Get amazing game bundles at unbeatable prices while supporting charities.",
    type: "website",
    url: "https://nextlevel.games",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
   const session = await auth();

    const groups = session?.['cognito:groups'] || [];
    const customerId = session?.['custom:customerId'];

    if(!customerId || !groups.includes('Customer')) {
        redirect('/onboarding', RedirectType.push)
    }

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SessionProvider session={session}>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
