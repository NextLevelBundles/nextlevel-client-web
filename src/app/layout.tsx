import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GameBundle Dashboard",
  description: "Manage your game bundles, keys, and achievements",
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
          <SessionProvider session={session}>
            {children}
            <Toaster position="top-right" expand={true} richColors />
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
