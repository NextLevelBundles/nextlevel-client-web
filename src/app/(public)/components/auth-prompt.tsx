"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";

interface AuthPromptProps {
  recipientEmail: string;
  hasAccount: boolean;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {hasAccount ? "Sign In to Accept Gift" : "Create Account to Accept Gift"}
        </CardTitle>
        <CardDescription>
          {hasAccount
            ? "You need to sign in to your account to accept this gift."
            : "You need to create an account to accept this gift."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            This gift is linked to <strong>{recipientEmail}</strong>.
            {hasAccount
              ? " Please sign in with this email address."
              : " Please create an account with this email address."}
          </AlertDescription>
        </Alert>

        {hasAccount ? (
          <>
            <Button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="w-full"
              size="lg"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href={`/signup?email=${encodeURIComponent(recipientEmail)}&returnUrl=${encodeURIComponent(returnUrl)}`}
                className="text-primary hover:underline"
              >
                Create one
              </Link>
            </div>
          </>
        ) : (
          <>
            <Button asChild className="w-full" size="lg">
              <Link
                href={`/signup?email=${encodeURIComponent(recipientEmail)}&returnUrl=${encodeURIComponent(returnUrl)}`}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </Link>
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={handleSignIn}
                className="text-primary hover:underline"
              >
                Sign in
              </button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}