"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthService } from "@/lib/auth/auth-service";
import { useRouter } from "next/navigation";
import { Hub } from "aws-amplify/utils";

interface User {
  id?: string;
  customerId?: string;
  email?: string;
  name?: string;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: (redirectUrl?: string) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadUser = async (retryCount = 0, maxRetries = 3) => {
    try {
      const result = await AuthService.getCurrentUser();
      if (result.success && result.user) {
        console.log(
          "AuthProvider: User loaded:",
          result.user,
          "customerId:",
          result.customerId
        );
        setUser({
          id: result.user.userId,
          customerId: result.customerId,
          email: result.attributes?.email,
          name: result.attributes?.name,
          emailVerified: result.attributes?.email_verified === "true",
        });
        setIsLoading(false);
      } else {
        setUser(null);
        // If this is not the last retry and no user found, retry after increasing delays
        // This handles the case where Amplify hasn't finished hydrating from localStorage
        // On mobile, this can take longer due to slower localStorage access
        if (retryCount < maxRetries) {
          const delay = 150 * (retryCount + 1); // 150ms, 300ms, 450ms
          console.log(`AuthProvider: Retrying user load in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
          setTimeout(() => loadUser(retryCount + 1, maxRetries), delay);
        } else {
          console.log("AuthProvider: No user found after max retries");
          setIsLoading(false);
        }
      }
    } catch (error) {
      // Only log non-authentication errors to avoid noise for public pages
      if (error instanceof Error && !error.message.includes("User needs to be authenticated")) {
        console.error("Error loading user:", error);
      }
      setUser(null);
      // Don't retry on authentication errors - user is simply not logged in
      if (error instanceof Error && error.message.includes("User needs to be authenticated")) {
        setIsLoading(false);
      } else if (retryCount < maxRetries) {
        // Retry on other errors in case Amplify wasn't ready
        const delay = 150 * (retryCount + 1);
        console.log(`AuthProvider: Retrying after error in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
        setTimeout(() => loadUser(retryCount + 1, maxRetries), delay);
      } else {
        console.log("AuthProvider: Failed to load user after max retries");
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    // Initial load
    loadUser();

    // Listen for auth events from Amplify Hub
    const hubListener = Hub.listen("auth", async ({ payload }) => {
      console.log("AuthProvider: Auth event received:", payload.event);

      switch (payload.event) {
        case "signedIn":
        case "tokenRefresh":
          // Reload user when signed in or tokens refreshed
          console.log("AuthProvider: Reloading user due to auth event");
          setIsLoading(true);
          await loadUser();
          break;

        case "signedOut":
        case "tokenRefresh_failure":
          // Clear user when signed out or token refresh fails
          console.log("AuthProvider: Clearing user due to auth event");
          setUser(null);
          setIsLoading(false);
          break;
      }
    });

    // Cleanup listener on unmount
    return () => {
      hubListener();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await AuthService.signIn(email, password);
      if (result.success && result.isSignedIn) {
        await loadUser();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Sign in error:", error);
      return false;
    }
  };

  const signOut = async (redirectUrl?: string) => {
    try {
      await AuthService.signOut();
      setUser(null);

      // Use full page reload to ensure auth state is cleared everywhere
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const refreshAuth = async () => {
    try {
      await AuthService.refreshTokens();
      await loadUser();
    } catch (error) {
      console.error("Refresh auth error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signIn, signOut, refreshAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
