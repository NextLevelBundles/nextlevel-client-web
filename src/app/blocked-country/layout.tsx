import { Metadata } from 'next';
import "../globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "../(shared)/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Service Unavailable - Digiphile',
  description: 'This service is not available in your region',
};

export default function BlockedCountryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html translate="no" lang="en" >
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}