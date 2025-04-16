import "./globals.css";
import type { Metadata } from "next";
import "@fontsource/orbitron/700.css";
import "@fontsource/rajdhani/600.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/home/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="bg-background text-foreground bg-[radial-gradient(ellipse_at_top_left,rgba(57,130,245,0.05),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(249,113,20,0.05),transparent_60%)]"
    >
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
