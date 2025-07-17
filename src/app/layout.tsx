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
import SessionRefresh from "./(shared)/providers/session-refresh";
import { QueryClientProviderWrapper } from "./(shared)/providers/query-client";

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

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Toaster
            position="bottom-right"
            expand={true}
            richColors
            theme="system"
            toastOptions={{
              classNames: {
                toast: "dark:bg-gray-900 dark:text-white dark:border-gray-700",
                title: "dark:text-white",
                description: "dark:text-gray-300",
                success:
                  "dark:bg-green-900 dark:text-green-100 dark:border-green-700",
                error: "dark:bg-red-900 dark:text-red-100 dark:border-red-700",
                warning:
                  "dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-700",
                info: "dark:bg-blue-900 dark:text-blue-100 dark:border-blue-700",
              },
            }}
          />

          <SessionProvider session={session} refetchOnWindowFocus={false}>
            <SessionRefresh />
            <IdTokenProvider>
              <QueryClientProviderWrapper>
                {children}
              </QueryClientProviderWrapper>
            </IdTokenProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
