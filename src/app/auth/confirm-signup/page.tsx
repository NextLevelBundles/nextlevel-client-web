"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthService } from "@/lib/auth/auth-service";
import { Button } from "@/app/(shared)/components/ui/button";
import { Input } from "@/app/(shared)/components/ui/input";
import { Label } from "@/app/(shared)/components/ui/label";
import { Alert, AlertDescription } from "@/app/(shared)/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { AuthLayout } from "../components/auth-layout";
import Link from "next/link";
import { toast } from "sonner";

export default function ConfirmSignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const isFromForgotPassword = searchParams.get("from") === "forgot-password";

  const [email] = useState(emailParam);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const isFormValid = email.length > 0 && code.length === 6;

  useEffect(() => {
    // If no email in URL, redirect to signup
    if (!emailParam) {
      router.push("/auth/signup");
    }
  }, [emailParam, router]);

  useEffect(() => {
    // Auto-send code ONLY once when component first mounts with a valid email
    // Remove this auto-send behavior as it causes issues with rate limiting
    // Users can manually request a code using the "Resend code" button
    // This prevents the infinite loop and rate limit issues
  }, []);

  useEffect(() => {
    // Handle resend timer countdown
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await AuthService.confirmSignUp(email, code);

      if (result.success && result.isSignUpComplete) {
        setSuccess(true);

        // If user came from forgot-password, redirect back to reset their password
        if (isFromForgotPassword) {
          toast.success("Email verified! You can now reset your password.");
          setTimeout(() => {
            router.push(`/auth/forgot-password?email=${encodeURIComponent(email)}`);
          }, 1000);
          return;
        }

        // Check the nextStep to determine what to do
        if (result.nextStep?.signUpStep === "COMPLETE_AUTO_SIGN_IN") {
          // Complete the auto sign-in process
          const autoSignInResult = await AuthService.handleAutoSignIn();

          if (autoSignInResult.success && autoSignInResult.isSignedIn) {
            // Wait to ensure token is synced (important for mobile)
            await new Promise(resolve => setTimeout(resolve, 300));

            // User is signed in via autoSignIn
            toast.success("Account confirmed! Signing you in...");
            setTimeout(() => {
              // Use window.location for full reload to ensure consistent auth state
              window.location.href = "/onboarding";
            }, 1000);
          } else {
            // AutoSignIn failed, redirect to sign in
            toast.success("Account confirmed! Please sign in.");
            setTimeout(() => {
              router.push("/auth/signin");
            }, 1000);
          }
        } else if (result.nextStep?.signUpStep === "DONE") {
          // Sign up is complete, check if user is signed in
          const currentUser = await AuthService.getCurrentUser();
          if (currentUser.success && currentUser.user) {
            // Wait to ensure token is synced (important for mobile)
            await new Promise(resolve => setTimeout(resolve, 300));

            // User is signed in
            toast.success("Account confirmed! Signing you in...");
            setTimeout(() => {
              // Use window.location for full reload to ensure consistent auth state
              window.location.href = "/onboarding";
            }, 1000);
          } else {
            // User is not signed in, redirect to sign in
            toast.success("Account confirmed! Please sign in.");
            setTimeout(() => {
              router.push("/auth/signin");
            }, 1000);
          }
        } else {
          // Default case - redirect to sign in
          toast.success("Account confirmed! Please sign in.");
          setTimeout(() => {
            router.push("/auth/signin");
          }, 1000);
        }
      } else {
        setError(result.error || "Confirmation failed. Please try again.");
      }
    } catch (err) {
      console.error("Confirmation error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async (silent = false) => {
    setError(null);
    if (!silent) {
      setIsResending(true);
    }

    try {
      // Call the resend confirmation code method
      const result = await AuthService.resendConfirmationCode(email);

      if (result.success) {
        if (!silent) {
          toast.success("Verification code sent!", {
            description: `A new code has been sent to ${email}`,
          });
          setResendTimer(30); // Start 30 second countdown
        }
      } else {
        if (!silent) {
          toast.error("Failed to resend code", {
            description: result.error || "Please try again later",
          });
        }
      }
    } catch (err) {
      console.error("Resend code error:", err);
      toast.error("Failed to resend code", {
        description: "Please try again later",
      });
    } finally {
      if (!silent) {
        setIsResending(false);
      }
    }
  };

  if (success) {
    return (
      <AuthLayout
        title={isFromForgotPassword ? "Email verified!" : "Account confirmed!"}
        subtitle={isFromForgotPassword ? "You can now reset your password" : "Your email has been verified successfully"}
      >
        <div className="space-y-6">
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              {isFromForgotPassword
                ? "Email verified! Redirecting to reset your password..."
                : "Your account has been confirmed successfully! You can now sign in."}
            </AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground text-center">
            {isFromForgotPassword ? "Redirecting to reset password..." : "Redirecting to sign in..."}
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={isFromForgotPassword
        ? "You need to verify your email before you can reset your password"
        : `We've sent a code to ${email}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="code" className="text-sm font-medium block mb-2">
            Verification Code
          </Label>
          <Input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="# # # # # #"
            required
            autoFocus
            autoComplete="one-time-code"
            className="w-full h-12 font-mono text-center text-lg tracking-[0.5em]"
            maxLength={6}
          />
          <p className="text-xs text-muted-foreground text-center">
            Enter 6-digit code
          </p>
        </div>

        <div className="space-y-4">
          <Button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full h-11"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-muted-foreground">
              Didn&apos;t receive the code?
            </span>
            <Button
              type="button"
              variant="link"
              onClick={() => handleResendCode(false)}
              disabled={isResending || resendTimer > 0}
              className="font-medium text-primary hover:text-primary/80 transition-colors p-0 h-auto"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                  Sending...
                </>
              ) : resendTimer > 0 ? (
                `Resend in ${resendTimer}s`
              ) : (
                "Resend code"
              )}
            </Button>
          </div>
        </div>

        <div className="text-center text-sm pt-4">
          <Link
            href="/auth/signin"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
