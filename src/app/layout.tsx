import "./globals.css";
import "@fontsource/orbitron/700.css";
import "@fontsource/rajdhani/600.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { ThemeProvider } from "./(shared)/components/theme-provider";
import { IdTokenProvider } from "./(shared)/contexts/id-token/id-token-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Digiphile | Gaming Bundles That Make a Difference",
  icons: [
    { rel: "icon", url: "/favicon/favicon.ico" },
    { rel: "apple-touch-icon", url: "/favicon/apple-touch-icon.png" },
  ],
  description:
    "Digiphile makes discovering content more collaborative. Our thoughtfully curated platform helps you find great new games, albums, films, and more. Explore exclusive promotions, engage with a knowledgeable community, and showcase your expertise as you discover new content together.",
  keywords: "game bundles, steam keys, charity gaming, indie games, game deals",
  openGraph: {
    title: "Digiphile Gaming Bundles",
    description:
      "Digiphile makes discovering content more collaborative. Our thoughtfully curated platform helps you find great new games, albums, films, and more. Explore exclusive promotions, engage with a knowledgeable community, and showcase your expertise as you discover new content together.",
    type: "website",
    url: "https://digiphile.co",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  console.log("Environment:", process.env);

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Toaster position="bottom-right" expand={true} richColors />

          <SessionProvider session={session} refetchOnWindowFocus={false}>
            <IdTokenProvider>{children}</IdTokenProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
