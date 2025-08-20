"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthService } from "@/lib/auth/auth-service";
import { useRouter } from "next/navigation";

interface User {
  id?: string;
  email?: string;
  name?: string;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadUser = async () => {
    try {
      const result = await AuthService.getCurrentUser();
      if (result.success && result.user) {
        setUser({
          id: result.user.userId,
          email: result.attributes?.email,
          name: result.attributes?.name,
          emailVerified: result.attributes?.email_verified === "true",
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error loading user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
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

  const signOut = async () => {
    try {
      await AuthService.signOut();
      setUser(null);
      router.push("/");
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
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, refreshAuth }}>
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