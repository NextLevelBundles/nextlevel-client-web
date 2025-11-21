"use client";

import { useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/(shared)/providers/auth-provider";
import { Check, Loader2, AlertCircle, Stamp as Steam } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { GiftDetailsCard } from "@/app/(public)/components/gift-details-card";
import { GiftAuthPrompt } from "@/app/(public)/components/gift-auth-prompt";
import { GiftProductsList } from "@/app/(public)/components/gift-products-list";
import { giftAcceptanceRateLimiter } from "@/lib/utils/rate-limiter";
import {
  useCartItemGift,
  useAcceptCartItemGift,
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

export default function CartItemGiftPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading: isLoadingAuth } = useAuth();

  const cartItemId = params.cartItemId as string;
  const email = searchParams.get("email") || user?.email || "";

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Use TanStack Query to fetch gift details
  const {
    data: gift,
    isLoading,
    error: queryError,
  } = useCartItemGift(cartItemId);

  // Fetch customer data to check Steam connection status (only if authenticated)
  const { data: customer } = useCustomer();

  const acceptGiftMutation = useAcceptCartItemGift();

  const error = queryError instanceof Error ? queryError.message : null;

  // Check if this is a Steam gift (based on platform)
  const isSteamGift = gift?.snapshotPlatform === "Steam";

  // Check if user has connected Steam
  const isSteamConnected = customer && customer.steamId;
  const needsSteamConnection = isSteamGift && user && !isSteamConnected;

  const handleAcceptGift = async () => {
    if (!gift) return;

    const emailToUse = email || user?.email;
    if (!emailToUse) {
      console.error("No email available for gift acceptance");
      return;
    }

    // Check rate limit
    const rateLimitKey = `gift-accept:${cartItemId}:${emailToUse}`;
    const { allowed } = giftAcceptanceRateLimiter.check(rateLimitKey);

    if (!allowed) {
      setShowConfirmDialog(false);
      return;
    }

    try {
      const response = await acceptGiftMutation.mutateAsync({
        cartItemId,
        email: emailToUse,
      });

      // Reset rate limit on success
      giftAcceptanceRateLimiter.reset(rateLimitKey);

      setShowConfirmDialog(false);

      if (response.redirectUrl) {
        router.push(response.redirectUrl);
      } else {
        if (gift.snapshotPlatform == "Ebook") {
          router.push("/customer/library/books");
        } else {
          router.push("/customer/library/steam-keys");
        }
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
    // Check email match if recipientEmail is set
    if (gift.recipientEmail && gift.recipientEmail !== user.email) return false;
    return true;
  };

  const isSelfGift =
    gift && user && gift.giftedByCustomerId === user.customerId;

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
              {error ||
                "This gift could not be found. Please check your link and try again."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const returnUrl = email
    ? `/gifts/collections/${cartItemId}?email=${encodeURIComponent(email)}`
    : `/gifts/collections/${cartItemId}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Welcome message for non-authenticated users */}
        <GiftDetailsCard
          title={gift.snapshotTitle}
          description={`${gift.quantity} × ${gift.snapshotProducts.length} items`}
          imageUrl={gift.snapshotImageUrl}
          bundleName={gift.snapshotTitle}
          giftedByName={gift.giftedByCustomerName}
          giftMessage={gift.giftMessage}
          createdAt={gift.giftedAt}
          expiresAt={undefined} // No expiry in the new model
          status={isGiftAccepted ? "Accepted" : "Pending"}
          additionalInfo={
            <GiftProductsList
              products={gift.snapshotProducts}
              platform={gift.snapshotPlatform}
            />
          }
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
                  giftTitle={gift.snapshotTitle}
                />
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
                  Connect your Steam account to accept this gift
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
                  Accept Gift
                </Button>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This gift is for {gift.recipientEmail || email}. Please sign
                  in with the correct account to accept it.
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
              .
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Gift?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to accept this gift? Once accepted, it will
              be added to your library and cannot be transferred to another
              account.
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
