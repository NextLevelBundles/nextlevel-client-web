"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthService } from "@/lib/auth/auth-service";
import { Button } from "@/app/(shared)/components/ui/button";
import { Input } from "@/app/(shared)/components/ui/input";
import { Label } from "@/app/(shared)/components/ui/label";
import { Alert, AlertDescription } from "@/app/(shared)/components/ui/alert";
import { Loader2, AlertCircle, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "../components/auth-layout";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/onboarding";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFormValid = email.length > 0 && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await AuthService.signIn(email, password);

      if (result.success && result.isSignedIn) {
        // Check if user has completed profile
        const hasProfile = await AuthService.hasCompletedProfile();

        // Redirect to callback URL if provided, otherwise use default based on profile status
        if (searchParams.get("callbackUrl")) {
          // Use window.location for full page reload to ensure auth state is updated
          window.location.href = callbackUrl;
        } else if (hasProfile) {
          router.push("/customer");
          router.refresh();
        } else {
          router.push("/onboarding");
          router.refresh();
        }
      } else if (result.nextStep?.signInStep === "CONFIRM_SIGN_UP") {
        // User needs to confirm their account
        router.push(`/auth/confirm-signup?email=${encodeURIComponent(email)}`);
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
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoComplete="email"
              className="w-full pl-10 h-11"
            />
          </div>
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
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              className="w-full pl-10 pr-10 h-11"
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
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isLoading || !isFormValid}
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
