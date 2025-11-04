"use client";

import { useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/(shared)/providers/auth-provider";
import { Check, Loader2, AlertCircle, Gamepad2, ExternalLink } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { GiftDetailsCard } from "@/app/(public)/components/gift-details-card";
import { GiftAuthPrompt } from "@/app/(public)/components/gift-auth-prompt";
import { giftAcceptanceRateLimiter } from "@/lib/utils/rate-limiter";
import { useSteamKeyGift, useAcceptSteamKeyGift } from "@/hooks/queries";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

export default function SteamKeyGiftPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading: isLoadingAuth } = useAuth();

  const assignmentId = params.assignmentId as string;
  const email = searchParams.get("email") || user?.email || "";

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Use TanStack Query to fetch gift details
  const {
    data: gift,
    isLoading,
    error: queryError,
  } = useSteamKeyGift(assignmentId, email, true);

  const acceptGiftMutation = useAcceptSteamKeyGift();

  const error = queryError instanceof Error ? queryError.message : null;

  const handleAcceptGift = async () => {
    if (!gift) return;

    const emailToUse = email || user?.email;
    if (!emailToUse) {
      console.error("No email available for gift acceptance");
      return;
    }

    // Check rate limit
    const rateLimitKey = `gift-accept:${assignmentId}:${emailToUse}`;
    const { allowed } = giftAcceptanceRateLimiter.check(rateLimitKey);

    if (!allowed) {
      setShowConfirmDialog(false);
      return;
    }

    try {
      const response = await acceptGiftMutation.mutateAsync({
        assignmentId,
        email: emailToUse,
      });

      // Reset rate limit on success
      giftAcceptanceRateLimiter.reset(rateLimitKey);

      setShowConfirmDialog(false);

      if (response.redirectUrl) {
        router.push(response.redirectUrl);
      } else {
        router.push("/customer/keys");
      }
    } catch (err) {
      console.error("Error accepting gift:", err);
      setShowConfirmDialog(false);
    }
  };

  const canAcceptGift = () => {
    if (!gift || !user) return false;
    if (gift.giftAccepted) return false;
    if (gift.recipientEmail && gift.recipientEmail !== user.email) return false;
    return true;
  };

  const isGiftPending = gift && !gift.giftAccepted;
  const isGiftAccepted = gift && gift.giftAccepted === true;

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Loading gift details...</p>
        </div>
      </div>
    );
  }

  if (error || !gift) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="mx-auto max-w-md">
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Gift Not Available
            </h3>
            <p className="text-sm text-muted-foreground">
              {error || "This gift could not be found. Please check your link and try again."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const returnUrl = email
    ? `/gifts/steam-keys/${assignmentId}?email=${encodeURIComponent(email)}`
    : `/gifts/steam-keys/${assignmentId}`;

  // Additional info for Steam key gifts
  const additionalInfo = (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Gamepad2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Game Details</span>
      </div>
      
      <div className="grid gap-2 text-sm">
        {gift.steamGameMetadata.developers && gift.steamGameMetadata.developers.length > 0 && (
          <div>
            <span className="text-muted-foreground">Developer:</span>{" "}
            {gift.steamGameMetadata.developers.join(", ")}
          </div>
        )}

        {gift.steamGameMetadata.publishers && gift.steamGameMetadata.publishers.length > 0 && (
          <div>
            <span className="text-muted-foreground">Publisher:</span>{" "}
            {gift.steamGameMetadata.publishers.join(", ")}
          </div>
        )}

        {gift.steamGameMetadata.releaseDate && (
          <div>
            <span className="text-muted-foreground">Release Date:</span>{" "}
            {new Date(gift.steamGameMetadata.releaseDate).toLocaleDateString()}
          </div>
        )}

        {gift.steamGameMetadata.steamAppId && (
          <div>
            <a
              href={`https://store.steampowered.com/app/${gift.steamGameMetadata.steamAppId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              View on Steam
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>
      
      <Alert>
        <Gamepad2 className="h-4 w-4" />
        <AlertDescription>
          This is a Steam game key. Once accepted, you&apos;ll be able to reveal the key and activate it on Steam.
        </AlertDescription>
      </Alert>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <GiftDetailsCard
          title={gift.title}
          description={undefined}
          imageUrl={gift.headerImage}
          bundleName={undefined}
          giftedByName={gift.giftedByCustomerName}
          giftMessage={gift.giftMessage}
          createdAt={gift.giftedAt}
          expiresAt={gift.expiresAt}
          status={isGiftAccepted ? "Accepted" : "Pending"}
          additionalInfo={additionalInfo}
        />

        {/* Authentication or Accept Button */}
        {isGiftPending && (
          <>
            {isLoadingAuth ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !user ? (
              <div className="mt-6">
                <GiftAuthPrompt
                  returnUrl={returnUrl}
                  giftTitle={gift.title}
                />
              </div>
            ) : canAcceptGift() ? (
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={acceptGiftMutation.isPending}
                  className="gap-2"
                >
                  <Check className="h-5 w-5" />
                  Accept Steam Key
                </Button>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This gift is for {gift.recipientEmail}. Please sign in with the correct account to accept it.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        {isGiftAccepted && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              This gift has already been accepted
              {gift.giftAcceptedAt &&
                ` on ${new Date(gift.giftAcceptedAt).toLocaleDateString()}`}
              . You can find the key in your Steam keys library.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Steam Key Gift?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to accept this Steam key? Once accepted, it will be added to your keys library and cannot be transferred to another account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAcceptGift}
              disabled={acceptGiftMutation.isPending}
            >
              {acceptGiftMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                "Accept Gift"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}