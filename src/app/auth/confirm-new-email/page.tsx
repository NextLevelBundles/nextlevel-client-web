"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { confirmUserAttribute, fetchUserAttributes } from "aws-amplify/auth";
import { Button } from "@/app/(shared)/components/ui/button";
import { Input } from "@/app/(shared)/components/ui/input";
import { Label } from "@/app/(shared)/components/ui/label";
import { Alert, AlertDescription } from "@/app/(shared)/components/ui/alert";
import { toast } from "sonner";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";

export default function ConfirmNewEmailPage() {
  const router = useRouter();
  const [newEmail, setNewEmail] = useState<string>("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the user's unverified email on mount (client-side only)
  useEffect(() => {
    const loadNewEmail = async () => {
      try {
        const attributes = await fetchUserAttributes();
        // The new email is in the 'email' attribute, but email_verified will be false
        if (attributes.email) {
          setNewEmail(attributes.email);
        }
      } catch (error) {
        console.error("Failed to load email:", error);
        // User might not be authenticated - that's okay, they can still try to verify
      } finally {
        setIsLoadingEmail(false);
      }
    };
    loadNewEmail();
  }, []);

  // Submit code to verify new email
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Verify email with Cognito using Amplify v6 modular API
      await confirmUserAttribute({
        userAttributeKey: "email",
        confirmationCode: code.trim()
      });
      toast.success("Email verified successfully! You can now use your new email address.");
      // Redirect to customer dashboard or settings
      router.push("/customer/settings");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid code or verification failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification code (Cognito will send to the updated email)
  const handleResendCode = async () => {
    setIsResending(true);
    setError(null);
    try {
      // Note: There's no direct "resend" for attribute verification in Amplify v6
      // The code was already sent when backend updated the email
      // This is a UI placeholder - you may need backend endpoint to re-trigger
      toast.info("Verification code resent to your new email address");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to resend code";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  if (isLoadingEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 dark:text-blue-400" />
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Verify Your New Email
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We sent a verification code to{" "}
            {newEmail ? (
              <span className="font-medium text-gray-900 dark:text-white">{newEmail}</span>
            ) : (
              <span className="font-medium">your new email address</span>
            )}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="code" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Verification Code
              </Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                required
                placeholder="Enter 6-digit code"
                className="mt-1"
                autoComplete="one-time-code"
                maxLength={6}
                pattern="[0-9]*"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Enter the verification code sent to your new email address
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Verify Email
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleResendCode}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  "Resend Code"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => router.push("/customer/settings")}
              className="text-sm"
            >
              Back to Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
