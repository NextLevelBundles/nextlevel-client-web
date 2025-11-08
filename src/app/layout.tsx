import "./globals.css";
import "@fontsource/orbitron/700.css";
import "@fontsource/rajdhani/600.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { ThemeProvider } from "./(shared)/components/theme-provider";
import { AuthProvider } from "./(shared)/providers/auth-provider";
import { AmplifyAuthListener } from "./(shared)/providers/amplify-auth-listener";
import { QueryClientProviderWrapper } from "./(shared)/providers/query-client";
import AmplifyClientLoader from "./(shared)/components/amplify/load-amplify";
import { TrackdeskScript } from "./(shared)/components/trackdesk/trackdesk-script";
import { LinkIdCapture } from "./(shared)/components/trackdesk/linkId-capture";

const funnelDisplay = localFont({
  src: "./../assets/fonts/Funnel_Display/FunnelDisplay-VariableFont_wght.ttf",
});

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={funnelDisplay.className}>
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

          <AuthProvider>
            <AmplifyAuthListener />
            <QueryClientProviderWrapper>{children}</QueryClientProviderWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
