"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth";
import { AuthService } from "@/lib/auth/auth-service";
import { Loader2 } from "lucide-react";

export default function RefreshTokenPage() {
  return (
    <Suspense>
      <RefreshTokenContent />
    </Suspense>
  );
}

function RefreshTokenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  useEffect(() => {
    const refreshAndRedirect = async () => {
      try {
        // Force refresh the tokens
        const session = await fetchAuthSession({ forceRefresh: true });
        
        if (session.tokens?.idToken) {
          // Sync the new ID token to cookie
          await AuthService.syncIdToken();
          
          // Small delay to ensure cookie is set
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Redirect back to the original page
          router.push(returnUrl);
        } else {
          // No valid session, redirect to sign in
          router.push(`/auth/signin?callbackUrl=${encodeURIComponent(returnUrl)}`);
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
        // On error, redirect to sign in
        router.push(`/auth/signin?callbackUrl=${encodeURIComponent(returnUrl)}`);
      }
    };

    refreshAndRedirect();
  }, [returnUrl, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">Refreshing your session...</p>
      </div>
    </div>
  );
}