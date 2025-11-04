"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, Loader2, Gift } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";

interface AuthPromptProps {
  recipientEmail?: string;
  hasAccount?: boolean;
  returnUrl: string;
}

export function AuthPrompt({
  recipientEmail,
  hasAccount,
  returnUrl,
}: AuthPromptProps) {
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = () => {
    setIsSigningIn(true);
    const signInUrl = new URL("/auth/signin", window.location.origin);
    signInUrl.searchParams.set("callbackUrl", returnUrl);
    router.push(signInUrl.toString());
  };

  const signupUrl = recipientEmail
    ? `/auth/signup?email=${encodeURIComponent(recipientEmail)}&returnUrl=${encodeURIComponent(returnUrl)}`
    : `/auth/signup?returnUrl=${encodeURIComponent(returnUrl)}`;

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Gift className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">
          Claim Your Gift
        </CardTitle>
        <CardDescription className="text-base">
          Create a free account or sign in to accept this gift
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3">
          <Button asChild className="w-full" size="lg">
            <Link href={signupUrl}>
              <UserPlus className="mr-2 h-5 w-5" />
              Create Free Account
            </Link>
          </Button>

          <Button
            variant="outline"
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full"
            size="lg"
          >
            {isSigningIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-5 w-5" />
                Sign In
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}