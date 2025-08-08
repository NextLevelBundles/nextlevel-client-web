"use client";

import { useEffect, useRef, useState } from "react";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/(shared)/components/ui/dialog";
import { Button } from "@/app/(shared)/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";

interface TurnstileCaptchaProps {
  isOpen: boolean;
  onVerified: (token: string) => void;
  onClose: () => void;
}

export function TurnstileCaptcha({ isOpen, onVerified, onClose }: TurnstileCaptchaProps) {
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    // Reset the widget and status when dialog opens
    if (isOpen) {
      setVerificationStatus('loading');
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
    }
  }, [isOpen]);

  const handleSuccess = (token: string) => {
    // Update status to success and wait a moment before closing
    setVerificationStatus('success');
    setTimeout(() => {
      onVerified(token);
    }, 500);
  };

  const handleError = () => {
    console.error("Turnstile verification failed");
    setVerificationStatus('error');
    // Reset the widget on error
    setTimeout(() => {
      if (turnstileRef.current) {
        turnstileRef.current.reset();
        setVerificationStatus('loading');
      }
    }, 2000);
  };

  const handleExpire = () => {
    // Token expired, reset the widget
    if (turnstileRef.current) {
      turnstileRef.current.reset();
    }
  };

  // Get the site key from environment variable
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    console.error("Turnstile site key is not configured");
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Security Check</DialogTitle>
          <DialogDescription>
            We&apos;re automatically verifying you&apos;re not a bot. This only takes a moment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          {!siteKey ? (
            <div className="text-destructive text-sm">
              Turnstile is not configured. Please add NEXT_PUBLIC_TURNSTILE_SITE_KEY to your environment variables.
            </div>
          ) : (
            <>
              <div className="min-h-[65px] flex items-center justify-center">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={siteKey}
                  onSuccess={handleSuccess}
                  onError={handleError}
                  onExpire={handleExpire}
                  options={{
                    theme: "auto",
                    size: "normal",
                  }}
                />
              </div>
              
              {verificationStatus === 'loading' && (
                <div className="text-sm text-muted-foreground text-center">
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                  Running automatic verification...
                </div>
              )}
              
              {verificationStatus === 'success' && (
                <div className="text-sm text-green-600 dark:text-green-400 text-center">
                  <CheckCircle className="h-4 w-4 inline mr-2" />
                  Verified! Redirecting to checkout...
                </div>
              )}
              
              {verificationStatus === 'error' && (
                <div className="text-sm text-destructive text-center">
                  Verification failed. Retrying...
                </div>
              )}
            </>
          )}

          {verificationStatus !== 'success' && (
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Cancel
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}