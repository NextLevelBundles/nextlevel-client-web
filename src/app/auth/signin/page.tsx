"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthService } from "@/lib/auth/auth-service";
import { Button } from "@/app/(shared)/components/ui/button";
import { Input } from "@/app/(shared)/components/ui/input";
import { Label } from "@/app/(shared)/components/ui/label";
import { Alert, AlertDescription } from "@/app/(shared)/components/ui/alert";
import { Loader2, AlertCircle, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { AuthLayout } from "../components/auth-layout";

type SignInStep = "CREDENTIALS" | "MFA_EMAIL" | "MFA_TOTP" | "MFA_SELECTION";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/onboarding";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // MFA States
  const [signInStep, setSignInStep] = useState<SignInStep>("CREDENTIALS");
  const [mfaCode, setMfaCode] = useState("");
  const [availableMfaMethods, setAvailableMfaMethods] = useState<string[]>([]);

  const isFormValid = email.length > 0 && password.length > 0;

  const validateFields = () => {
    const errors: typeof fieldErrors = {};

    if (email.length === 0) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (password.length === 0) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignInSuccess = async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const hasProfile = await AuthService.hasCompletedProfile();

    if (searchParams.get("callbackUrl")) {
      window.location.href = callbackUrl;
    } else if (hasProfile) {
      window.location.href = "/customer";
    } else {
      window.location.href = "/onboarding";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateFields()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await AuthService.signIn(email, password);

      if (result.success && result.isSignedIn) {
        await handleSignInSuccess();
      } else if (result.nextStep?.signInStep === "CONFIRM_SIGN_UP") {
        router.push(`/auth/confirm-signup?email=${encodeURIComponent(email)}`);
      } else if (result.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_EMAIL_CODE") {
        setSignInStep("MFA_EMAIL");
      } else if (result.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_TOTP_CODE") {
        setSignInStep("MFA_TOTP");
      } else if (result.nextStep?.signInStep === "CONTINUE_SIGN_IN_WITH_MFA_SELECTION") {
        const methods = result.nextStep.allowedMFATypes || [];
        setAvailableMfaMethods(methods);
        setSignInStep("MFA_SELECTION");
      } else {
        setError(result.error || "Sign in failed. Please try again.");
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mfaCode.length < 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      const result = await AuthService.confirmSignInWithMFA(mfaCode);

      if (result.success && result.isSignedIn) {
        await handleSignInSuccess();
      } else {
        setError(result.error || "Invalid code. Please try again.");
      }
    } catch (err) {
      console.error("MFA verification error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFASelection = async (method: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await AuthService.confirmSignInWithMFA(method);

      if (result.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_EMAIL_CODE") {
        setSignInStep("MFA_EMAIL");
      } else if (result.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_TOTP_CODE") {
        setSignInStep("MFA_TOTP");
      } else {
        setError("Unexpected response. Please try again.");
      }
    } catch (err) {
      console.error("MFA selection error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetToCredentials = () => {
    setSignInStep("CREDENTIALS");
    setMfaCode("");
    setError(null);
  };

  // MFA Selection Screen
  if (signInStep === "MFA_SELECTION") {
    return (
      <AuthLayout
        title="Choose verification method"
        subtitle="Select how you'd like to verify your identity"
      >
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {availableMfaMethods.includes("EMAIL") && (
              <Button
                onClick={() => handleMFASelection("EMAIL")}
                disabled={isLoading}
                variant="outline"
                className="w-full h-14 justify-start gap-3"
              >
                <Mail className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Email</div>
                  <div className="text-xs text-muted-foreground">
                    Receive a code via email
                  </div>
                </div>
              </Button>
            )}
            {availableMfaMethods.includes("TOTP") && (
              <Button
                onClick={() => handleMFASelection("TOTP")}
                disabled={isLoading}
                variant="outline"
                className="w-full h-14 justify-start gap-3"
              >
                <ShieldCheck className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Authenticator App</div>
                  <div className="text-xs text-muted-foreground">
                    Use your authenticator app
                  </div>
                </div>
              </Button>
            )}
          </div>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={resetToCredentials}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // MFA Code Entry Screen (Email or TOTP)
  if (signInStep === "MFA_EMAIL" || signInStep === "MFA_TOTP") {
    const isEmail = signInStep === "MFA_EMAIL";
    return (
      <AuthLayout
        title="Two-factor authentication"
        subtitle={
          isEmail
            ? "Enter the verification code sent to your email"
            : "Enter the code from your authenticator app"
        }
      >
        <form onSubmit={handleMFASubmit} className="space-y-5">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="mfaCode" className="text-sm font-medium block mb-2">
              Verification code
            </Label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                id="mfaCode"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setMfaCode(value);
                }}
                placeholder="000000"
                autoComplete="one-time-code"
                className="w-full pl-10 h-11 text-center text-lg tracking-widest"
                autoFocus
              />
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading || mfaCode.length < 6}
              className="w-full h-11"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </div>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={resetToCredentials}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to sign in
            </button>
          </div>
        </form>
      </AuthLayout>
    );
  }

  // Credentials Screen (Default)
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
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

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
              className={`w-full pl-10 pr-10 h-11 ${
                fieldErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
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
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </div>

        <div className="text-center text-sm pt-4">
          <span className="text-muted-foreground">Don't have an account?</span>{" "}
          <Link
            href="/auth/signup"
            className="font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
