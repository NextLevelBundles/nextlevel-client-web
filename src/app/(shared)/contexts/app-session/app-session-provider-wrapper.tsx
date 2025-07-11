import { ReactNode } from "react";
import { auth } from "@/auth";
import AppSessionProvider from "./app-session-provider";

interface AppSessionProviderWrapperProps {
  children: ReactNode;
}

export async function AppSessionProviderWrapper({
  children,
}: AppSessionProviderWrapperProps) {
  // Load session on the server
  let initialSession = null;

  try {
    // Only attempt to load cart data if we're on the server
    if (typeof window === "undefined") {
      initialSession = await auth();
    }
  } catch (error) {
    console.error("Failed to load initial cart data:", error);
    // Continue with null initial cart - client will handle loading
  }

  return (
    <AppSessionProvider initialSession={initialSession}>
      {children}
    </AppSessionProvider>
  );
}
