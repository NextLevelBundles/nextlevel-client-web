"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthService } from "@/lib/auth/auth-service";
import { Button } from "@/app/(shared)/components/ui/button";
import { Input } from "@/app/(shared)/components/ui/input";
import { Label } from "@/app/(shared)/components/ui/label";
import { Alert, AlertDescription } from "@/app/(shared)/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle, Mail } from "lucide-react";
import { AuthLayout } from "../components/auth-layout";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
  }>({});

  const isFormValid = email.length > 0;

  const validateFields = () => {
    const errors: typeof fieldErrors = {};

    // Validate email
    if (email.length === 0) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateFields()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await AuthService.resetPassword(email);

      if (result.success) {
        setSuccess(true);
        // Redirect to reset password confirmation page
        setTimeout(() => {
          router.push(
            `/auth/reset-password?email=${encodeURIComponent(email)}`
          );
        }, 2000);
      } else if (result.isUserNotVerified) {
        await AuthService.resendConfirmationCode(email);
        router.push(`/auth/confirm-signup?email=${encodeURIComponent(email)}&from=forgot-password`);
      } else {
        setError(
          result.error || "Failed to send reset code. Please try again."
        );
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We've sent a password reset code to your email"
      >
        <div className="space-y-6">
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Password reset code sent! Check your email for the verification
              code.
            </AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground text-center">
            Redirecting to reset page...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email address and we'll send you a reset code"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium block mb-2">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              placeholder="Enter your email"
              autoComplete="email"
              className={`w-full pl-10 h-11 ${
                fieldErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
            />
          </div>
          {fieldErrors.email && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
          )}
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset code...
              </>
            ) : (
              "Send Reset Code"
            )}
          </Button>
        </div>

        <div className="text-center text-sm pt-4">
          <span className="text-muted-foreground">Remember your password?</span>{" "}
          <Link
            href="/auth/signin"
            className="font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
