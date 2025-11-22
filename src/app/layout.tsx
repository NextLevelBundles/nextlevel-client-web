import "./globals.css";
import "@fontsource/orbitron/700.css";
import "@fontsource/rajdhani/600.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Toaster } from "sonner";
import { ThemeProvider } from "./(shared)/components/theme-provider";
import { AuthProvider } from "./(shared)/providers/auth-provider";
import { AmplifyAuthListener } from "./(shared)/providers/amplify-auth-listener";
import { QueryClientProviderWrapper } from "./(shared)/providers/query-client";
import AmplifyClientLoader from "./(shared)/components/amplify/load-amplify";
import { TrackdeskScript } from "./(shared)/components/trackdesk/trackdesk-script";
import { LinkIdCapture } from "./(shared)/components/trackdesk/linkId-capture";
import { GoogleAnalytics } from "@next/third-parties/google";

const funnelDisplay = localFont({
  src: "./../assets/fonts/Funnel_Display/FunnelDisplay-VariableFont_wght.ttf",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://digiphile.co"),
  title: "Digiphile - Expert-Curated Game & Book Collections",
  icons: [
    { rel: "icon", url: "/favicon/favicon.ico" },
    { rel: "apple-touch-icon", url: "/favicon/apple-touch-icon.png" },
  ],
  description:
    "Expert-curated, premium game and book collections from Humble Bundle vets offering discovery options for digital media enthusiasts like the Games Exchange.",
  keywords:
    "steam game collections, steam keys, charity gaming, indie games, game deals",
  openGraph: {
    title: "Digiphile - Expert-Curated Game & Book Collections",
    description:
      "Expert-curated, premium game and book collections from Humble Bundle vets offering discovery options for digital media enthusiasts like the Games Exchange.",
    type: "website",
    url: "https://digiphile.co",
    siteName: "Digiphile",
    images: [
      {
        url: "https://static.digiphile.co/digiphile-social.jpg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digiphile - Expert-Curated Game & Book Collections",
    description:
      "Expert-curated, premium game and book collections from Humble Bundle vets offering discovery options for digital media enthusiasts like the Games Exchange.",
    images: ["https://static.digiphile.co/digiphile-social.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={funnelDisplay.className}>
        <Script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="d305e18c-0ae8-4ce6-a40a-05a55fa30712"
          data-blockingmode="auto"
          strategy="beforeInteractive"
          type="text/javascript"
          async={true}
        />
        <AmplifyClientLoader />
        <TrackdeskScript />
        <LinkIdCapture />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Toaster
            position="bottom-right"
            expand={true}
            richColors
            theme="system"
            toastOptions={{
              classNames: {
                toast:
                  "bg-background text-foreground border-border dark:bg-gray-900 dark:text-white dark:border-gray-700",
                title: "text-foreground dark:text-white",
                description: "text-muted-foreground dark:text-gray-300",
                success:
                  "bg-green-50 text-green-900 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-700",
                error:
                  "bg-red-50 text-red-900 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-700",
                warning:
                  "bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-700",
                info: "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-700",
              },
            }}
          />

          <AuthProvider>
            <AmplifyAuthListener />
            <QueryClientProviderWrapper>{children}</QueryClientProviderWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>

      <GoogleAnalytics gaId="G-18BN8WBRPD" />
    </html>
  );
}
