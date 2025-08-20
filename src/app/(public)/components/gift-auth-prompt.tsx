"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, Loader2, Gift, Lock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { motion } from "framer-motion";

interface GiftAuthPromptProps {
  recipientEmail: string;
  hasAccount: boolean;
  returnUrl: string;
  giftTitle?: string;
}

export function GiftAuthPrompt({
  recipientEmail,
  hasAccount,
  returnUrl,
  giftTitle,
}: GiftAuthPromptProps) {
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const signupLink = `${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/signup?response_type=code&client_id=${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI}&scope=openid+email+phone+profile`;

  const handleSignIn = () => {
    setIsSigningIn(true);
    const signInUrl = new URL("/auth/signin", window.location.origin);
    signInUrl.searchParams.set("callbackUrl", returnUrl);
    router.push(signInUrl.toString());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">
              {hasAccount
                ? "Sign In to Claim Your Gift"
                : "Create Account to Claim Your Gift"}
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              To claim {giftTitle ? `"${giftTitle}"` : "this gift"}, you need a
              Digiphile account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-primary/5 border-primary/20">
            <Gift className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              This gift is waiting for{" "}
              <strong className="font-semibold">{recipientEmail}</strong>
              {hasAccount
                ? ". Sign in with this email to claim it."
                : ". Create your free account with this email to get started."}
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
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
                      Sign In to Claim Gift
                    </>
                  )}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      or
                    </span>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full" size="lg">
                  <Link
                    href={signupLink}
                    // href={`/signup?email=${encodeURIComponent(recipientEmail)}&returnUrl=${encodeURIComponent(returnUrl)}`}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create New Account
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild className="w-full" size="lg">
                  <Link
                    href={signupLink}

                    // href={`/signup?email=${encodeURIComponent(recipientEmail)}&returnUrl=${encodeURIComponent(returnUrl)}`}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Your Free Account
                  </Link>
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      or
                    </span>
                  </div>
                </div>
                <Button
                  onClick={handleSignIn}
                  variant="outline"
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
                      Sign In to Existing Account
                    </>
                  )}
                </Button>
              </>
            )}
          </div>

          <div className="pt-4 border-t text-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Why do I need an account?</span>
              <br />
              Your Digiphile account securely stores your games, tracks your
              purchases, and lets you manage your digital library.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
