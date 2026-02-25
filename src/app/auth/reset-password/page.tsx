"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthService, validatePassword } from "@/lib/auth/auth-service";
import { Button } from "@/app/(shared)/components/ui/button";
import { Input } from "@/app/(shared)/components/ui/input";
import { Label } from "@/app/(shared)/components/ui/label";
import { Alert, AlertDescription } from "@/app/(shared)/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle, Lock, Hash, Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "../components/auth-layout";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email] = useState(emailParam);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    code?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const isFormValid =
    email.length > 0 &&
    code.length === 6 &&
    newPassword.length >= 8 &&
    confirmPassword === newPassword;

  useEffect(() => {
    // If no email in URL, redirect to forgot-password
    if (!emailParam) {
      router.push("/auth/forgot-password");
    }
  }, [emailParam, router]);

  const validateFields = () => {
    const errors: typeof fieldErrors = {};

    // Validate code
    if (code.length === 0) {
      errors.code = "Verification code is required";
    } else if (code.length !== 6) {
      errors.code = "Code must be 6 digits";
    }

    // Validate new password
    if (newPassword.length === 0) {
      errors.newPassword = "Password is required";
    } else {
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        errors.newPassword = passwordValidation.errors[0];
      }
    }

    // Validate confirm password
    if (confirmPassword.length === 0) {
      errors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
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
      const result = await AuthService.confirmResetPassword(email, code, newPassword);

      if (result.success) {
        setSuccess(true);
        // Redirect to sign in page after 2 seconds
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
      } else {
        setError(result.error || "Password reset failed. Please try again.");
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
        title="Password reset successful"
        subtitle="You can now sign in with your new password"
      >
        <div className="space-y-6">
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Your password has been reset successfully!
            </AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground text-center">
            Redirecting to sign in...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={`We've sent a code to ${email}`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="code"
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (fieldErrors.code) {
                  setFieldErrors((prev) => ({ ...prev, code: undefined }));
                }
              }}
              placeholder="# # # # # #"
              autoFocus
              autoComplete="one-time-code"
              className={`w-full pl-10 h-12 font-mono text-center tracking-[0.5em] text-lg ${
                fieldErrors.code ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
              maxLength={6}
            />
          </div>
          {fieldErrors.code ? (
            <p className="text-xs text-red-500 text-center">{fieldErrors.code}</p>
          ) : (
            <p className="text-xs text-muted-foreground text-center">
              Enter 6-digit code from your email
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-sm font-medium block mb-2">
            New Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (fieldErrors.newPassword) {
                  setFieldErrors((prev) => ({ ...prev, newPassword: undefined }));
                }
              }}
              placeholder="Create a new password"
              autoComplete="new-password"
              className={`w-full pl-10 pr-10 h-11 ${
                fieldErrors.newPassword ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {fieldErrors.newPassword ? (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.newPassword}</p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              Must be 8+ characters with uppercase, lowercase, number, and symbol
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium block mb-2">
            Confirm New Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) {
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }
              }}
              placeholder="Confirm your new password"
              autoComplete="new-password"
              className={`w-full pl-10 pr-10 h-11 ${
                fieldErrors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
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
                Resetting password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}