"use client";

import { useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/(shared)/providers/auth-provider";
import {
  Check,
  Loader2,
  AlertCircle,
  Gamepad2,
  ExternalLink,
  Stamp as Steam,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { GiftDetailsCard } from "@/app/(public)/components/gift-details-card";
import { GiftAuthPrompt } from "@/app/(public)/components/gift-auth-prompt";
import { giftAcceptanceRateLimiter } from "@/lib/utils/rate-limiter";
import {
  useSteamKeyGift,
  useAcceptSteamKeyGift,
  useCustomer,
} from "@/hooks/queries";
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

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Use TanStack Query to fetch gift details
  const {
    data: gift,
    isLoading,
    error: queryError,
  } = useSteamKeyGift(assignmentId);
  // Fetch customer data to check Steam connection status (only if authenticated)
  const { data: customer } = useCustomer();

  const acceptGiftMutation = useAcceptSteamKeyGift();

  const error = queryError instanceof Error ? queryError.message : null;

  // Check if user has connected Steam (Steam key gifts always require Steam connection)
  const isSteamConnected = customer && customer.steamId;
  const needsSteamConnection = user && !isSteamConnected;

  const handleAcceptGift = async () => {
    if (!gift || !user?.email) return;

    // Check rate limit
    const rateLimitKey = `gift-accept:${assignmentId}:${user.email}`;
    const { allowed } = giftAcceptanceRateLimiter.check(rateLimitKey);

    if (!allowed) {
      setShowConfirmDialog(false);
      return;
    }

    try {
      const response = await acceptGiftMutation.mutateAsync({
        assignmentId,
        email: user.email,
      });

      // Reset rate limit on success
      giftAcceptanceRateLimiter.reset(rateLimitKey);

      setShowConfirmDialog(false);

      if (response.redirectUrl) {
        router.push(response.redirectUrl);
      } else {
        router.push("/customer/library/steam-keys");
      }
    } catch (err) {
      console.error("Error accepting gift:", err);
      setShowConfirmDialog(false);
    }
  };

  const canAcceptGift = () => {
    if (!gift || !user) return false;
    // Gift must be pending (not accepted yet)
    if (gift.giftAccepted === true) return false;
    // Users cannot accept their own gifts
    if (gift.giftedByCustomerId === user.customerId) return false;
    // Check email match if recipientEmail is set (Optional)
    // if (gift.giftRecipientEmail && gift.giftRecipientEmail !== user.email) return false;
    return true;
  };

  const isSelfGift =
    gift && user && gift.giftedByCustomerId === user.customerId;
  const isGiftPending = gift && !gift.giftAccepted;
  const isGiftAccepted = gift && gift.giftAccepted === true;

  // Show loading state while gift is loading
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

  // Show error if gift not found
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
              {error ||
                "This gift could not be found. Please check your link and try again."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const returnUrl = `/gifts/steam-keys/${assignmentId}`;

  // Additional info for Steam key gifts
  const additionalInfo = (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Gamepad2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Game Details</span>
      </div>

      <div className="grid gap-2 text-sm">
        {gift.steamGameMetadata?.developers &&
          gift.steamGameMetadata.developers.length > 0 && (
            <div>
              <span className="text-muted-foreground">Developer:</span>{" "}
              {gift.steamGameMetadata.developers.join(", ")}
            </div>
          )}

        {gift.steamGameMetadata?.publishers &&
          gift.steamGameMetadata.publishers.length > 0 && (
            <div>
              <span className="text-muted-foreground">Publisher:</span>{" "}
              {gift.steamGameMetadata.publishers.join(", ")}
            </div>
          )}

        {gift.steamGameMetadata?.releaseDate && (
          <div>
            <span className="text-muted-foreground">Release Date:</span>{" "}
            {new Date(gift.steamGameMetadata.releaseDate).toLocaleDateString()}
          </div>
        )}

        {gift.steamGameMetadata?.steamAppId && (
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
          This is a Steam game key. Once accepted, you&apos;ll be able to reveal
          the key and activate it on Steam.
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
          imageUrl={gift.coverImage?.url}
          bundleName={undefined}
          giftedByName={gift.giftedByCustomerName}
          giftMessage={gift.giftMessage}
          createdAt={gift.giftedAt}
          expiresAt={gift.giftExpiresAt || undefined}
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
                <GiftAuthPrompt returnUrl={returnUrl} giftTitle={gift.title} />
              </div>
            ) : isSelfGift ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You cannot accept your own gift. This gift was sent by you and
                  needs to be accepted by the recipient.
                </AlertDescription>
              </Alert>
            ) : needsSteamConnection ? (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => router.push("/customer/settings/steam")}
                >
                  <Steam className="mr-2 h-4 w-4" />
                  Connect Steam Account
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Connect your Steam account to accept this Steam key gift
                </p>
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
                  This gift is for {gift.giftRecipientEmail}. Please sign in
                  with the correct account to accept it.
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
              Are you sure you want to accept this Steam key? Once accepted, it
              will be added to your keys library and cannot be transferred to
              another account.
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
