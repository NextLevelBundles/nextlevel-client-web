"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthService } from "@/lib/auth/auth-service";
import { Button } from "@/app/(shared)/components/ui/button";
import { Input } from "@/app/(shared)/components/ui/input";
import { Label } from "@/app/(shared)/components/ui/label";
import { Alert, AlertDescription } from "@/app/(shared)/components/ui/alert";
import { Loader2, AlertCircle, Mail, Lock, Eye, EyeOff, ShieldCheck, Fingerprint, ArrowLeft, Smartphone } from "lucide-react";
import { Checkbox } from "@/app/(shared)/components/ui/checkbox";
import { AuthLayout } from "../components/auth-layout";

type SignInStep =
  | "EMAIL"
  | "AUTH_OPTIONS"
  | "PASSWORD"
  | "MFA_EMAIL"
  | "MFA_TOTP"
  | "MFA_SELECTION";

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/onboarding";

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Flow state
  const [signInStep, setSignInStep] = useState<SignInStep>("EMAIL");
  const [mfaCode, setMfaCode] = useState("");
  const [availableMfaMethods, setAvailableMfaMethods] = useState<string[]>([]);

  // Available auth methods from USER_AUTH flow
  const [availableChallenges, setAvailableChallenges] = useState<string[]>([]);

  // Remember device state
  const [rememberDevice, setRememberDevice] = useState(false);

  const validateEmail = () => {
    if (email.length === 0) {
      setFieldErrors({ email: "Email is required" });
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldErrors({ email: "Please enter a valid email address" });
      return false;
    }
    setFieldErrors({});
    return true;
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

  // Step 1: Submit email - discover available auth methods
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await AuthService.discoverAuthMethods(email);

      if (result.isSignedIn) {
        await handleSignInSuccess();
        return;
      }

      if (result.nextStep?.signInStep === "CONFIRM_SIGN_UP") {
        router.push(`/auth/confirm-signup?email=${encodeURIComponent(email)}`);
        return;
      }

      if (!result.success) {
        setError(result.error || "Failed to check authentication options. Please try again.");
        return;
      }

      // Store available challenges
      setAvailableChallenges(result.availableChallenges);

      const hasPasskey = result.availableChallenges.includes("WEB_AUTHN");
      const hasPassword = result.availableChallenges.includes("PASSWORD") || result.availableChallenges.includes("PASSWORD_SRP");

      // If only one option available, skip the choice screen
      if (hasPassword && !hasPasskey) {
        // Only password available - go directly to password screen
        // We'll use USER_SRP_AUTH when submitting the password for device tracking support
        setSignInStep("PASSWORD");
        return;
      } else if (hasPasskey && !hasPassword) {
        // Only passkey available - trigger passkey directly
        const passkeyResult = await AuthService.selectFirstFactor("WEB_AUTHN");
        if (passkeyResult.success && passkeyResult.isSignedIn) {
          await handleSignInSuccess();
          return;
        }
        // If passkey failed, restart and show options
        setError(passkeyResult.error || "Passkey authentication failed.");
      }

      // Multiple options available - show choice screen
      setSignInStep("AUTH_OPTIONS");
    } catch (err) {
      console.error("Email submit error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle selecting password authentication
  // Simply transition to password screen - we'll use USER_SRP_AUTH when submitting
  const handleSelectPassword = async () => {
    setSignInStep("PASSWORD");
  };

  // Handle selecting passkey authentication
  const handleSelectPasskey = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await AuthService.selectFirstFactor("WEB_AUTHN");

      if (result.success && result.isSignedIn) {
        await handleSignInSuccess();
      } else {
        // If passkey failed, session is consumed. Need to restart for password option.
        // Restart discovery so user can try password
        const rediscover = await AuthService.discoverAuthMethods(email);
        if (rediscover.success) {
          setAvailableChallenges(rediscover.availableChallenges);
        }
        setError(result.error || "Passkey authentication failed. Please try another method.");
      }
    } catch (err) {
      console.error("Select passkey error:", err);
      // Restart discovery on error
      const rediscover = await AuthService.discoverAuthMethods(email);
      if (rediscover.success) {
        setAvailableChallenges(rediscover.availableChallenges);
      }
      setError("Passkey authentication failed. Please try another method.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password submission
  // Uses USER_SRP_AUTH flow which properly supports device tracking for MFA suppression
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length === 0) {
      setFieldErrors({ password: "Password is required" });
      return;
    }

    setIsLoading(true);

    try {
      // Use SRP auth flow for proper device tracking support
      const result = await AuthService.signInWithSRP(email, password);

      if (result.success && result.isSignedIn) {
        await handleSignInSuccess();
      } else if (result.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_EMAIL_CODE") {
        setSignInStep("MFA_EMAIL");
      } else if (result.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_TOTP_CODE") {
        setSignInStep("MFA_TOTP");
      } else if (result.nextStep?.signInStep === "CONTINUE_SIGN_IN_WITH_MFA_SELECTION") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const methods = (result.nextStep as any).allowedMFATypes || [];
        setAvailableMfaMethods(methods);
        setSignInStep("MFA_SELECTION");
      } else if (result.nextStep?.signInStep == "CONFIRM_SIGN_UP") {
        await AuthService.resendConfirmationCode(email);
        router.push(`/auth/confirm-signup?email=${encodeURIComponent(email)}`);
      }
       else {
        setError(result.error || "Sign in failed. Please try again.");
      }
    } catch (err) {
      console.error("Password submit error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle MFA code submission
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
        // Remember device if user opted in
        if (rememberDevice) {
          await AuthService.rememberCurrentDevice();
        }
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

  // Handle MFA method selection
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

  // Go back to email step (restarts the flow)
  const resetToEmail = () => {
    setSignInStep("EMAIL");
    setPassword("");
    setMfaCode("");
    setError(null);
    setFieldErrors({});
    setAvailableChallenges([]);
  };

  // Sign up link component (reused across screens)
  const SignUpLink = () => (
    <div className="text-center text-sm pt-4">
      <span className="text-muted-foreground">Don&apos;t have an account?</span>{" "}
      <Link
        href="/auth/signup"
        className="font-semibold text-primary hover:text-primary/80 transition-colors"
      >
        Sign up
      </Link>
    </div>
  );

  // Helper to check if a challenge is available
  const hasChallenge = (challenge: string) => {
    return availableChallenges.includes(challenge);
  };

  // Step 1: Email Entry Screen
  if (signInStep === "EMAIL") {
    return (
      <AuthLayout
        title="Welcome back"
        subtitle="Enter your email to sign in"
      >
        <form onSubmit={handleEmailSubmit} className="space-y-5">
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
                    setFieldErrors({});
                  }
                }}
                placeholder="Enter your email"
                autoComplete="email"
                autoFocus
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
                  Checking...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>

          <SignUpLink />
        </form>
      </AuthLayout>
    );
  }

  // Step 2: Auth Options Screen - Show available authentication methods
  if (signInStep === "AUTH_OPTIONS") {
    const showPasskey = hasChallenge("WEB_AUTHN");
    const showPassword = hasChallenge("PASSWORD") || hasChallenge("PASSWORD_SRP");

    return (
      <AuthLayout
        title="Choose how to sign in"
        subtitle={email}
      >
        <div className="space-y-5">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {/* Passkey Option - Show first if available */}
            {showPasskey && (
              <Button
                onClick={handleSelectPasskey}
                disabled={isLoading}
                variant="default"
                className="w-full h-14 justify-start gap-3"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Fingerprint className="h-5 w-5" />
                )}
                <div className="text-left">
                  <div className="font-medium">Sign in with Passkey</div>
                  <div className="text-xs opacity-80">
                    Use your device&apos;s biometrics or screen lock
                  </div>
                </div>
              </Button>
            )}

            {/* Password Option */}
            {showPassword && (
              <Button
                onClick={handleSelectPassword}
                disabled={isLoading}
                variant={showPasskey ? "outline" : "default"}
                className="w-full h-14 justify-start gap-3"
              >
                {isLoading && !showPasskey ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Lock className="h-5 w-5" />
                )}
                <div className="text-left">
                  <div className="font-medium">Sign in with Password</div>
                  <div className="text-xs text-muted-foreground">
                    Use your account password
                  </div>
                </div>
              </Button>
            )}

            {/* No options available */}
            {!showPasskey && !showPassword && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No authentication methods available. Please contact support.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={resetToEmail}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Use a different email
            </button>
          </div>

          <SignUpLink />
        </div>
      </AuthLayout>
    );
  }

  // Step 3: Password Entry Screen
  if (signInStep === "PASSWORD") {
    return (
      <AuthLayout
        title="Enter your password"
        subtitle={email}
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Link
                href={`/auth/forgot-password?email=${encodeURIComponent(email)}`}
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
                    setFieldErrors({});
                  }
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
                autoFocus
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

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={resetToEmail}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Use a different email
            </button>
          </div>

          <SignUpLink />
        </form>
      </AuthLayout>
    );
  }

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
              onClick={resetToEmail}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
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

          <div className="flex items-center space-x-3 pt-2">
            <Checkbox
              id="rememberDevice"
              checked={rememberDevice}
              onCheckedChange={(checked) => setRememberDevice(checked === true)}
            />
            <Label
              htmlFor="rememberDevice"
              className="text-sm text-muted-foreground cursor-pointer flex items-center gap-2"
            >
              <Smartphone className="h-4 w-4" />
              Remember this device for 30 days
            </Label>
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
              onClick={resetToEmail}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to sign in
            </button>
          </div>
        </form>
      </AuthLayout>
    );
  }

  // Fallback (should not reach here)
  return null;
}
