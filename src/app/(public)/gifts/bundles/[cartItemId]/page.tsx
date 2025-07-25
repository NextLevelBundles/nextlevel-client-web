"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { toast } from "sonner";
import { giftApi } from "@/lib/api";
import { CartItemGift } from "@/lib/api/types/gift";
import { GiftDetailsCard } from "@/app/(public)/components/gift-details-card";
import { GiftAuthPrompt } from "@/app/(public)/components/gift-auth-prompt";
import { GiftProductsList } from "@/app/(public)/components/gift-products-list";
import { giftAcceptanceRateLimiter } from "@/lib/utils/rate-limiter";
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
  const { data: session, status: sessionStatus } = useSession();

  const cartItemId = params.cartItemId as string;
  const email = searchParams.get("email");

  const [gift, setGift] = useState<CartItemGift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (!email) {
      setError("Email parameter is required");
      setIsLoading(false);
      return;
    }

    const fetchGiftDetails = async () => {
      try {
        setIsLoading(true);
        const giftData = await giftApi.getCartItemGift(cartItemId, email);
        console.log(giftData);
        setGift(giftData);
      } catch (err) {
        console.error("Error fetching gift:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load gift details"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchGiftDetails();
  }, [cartItemId, email]);

  const handleAcceptGift = async () => {
    if (!email || !gift) return;

    // Check rate limit
    const rateLimitKey = `gift-accept:${cartItemId}:${email}`;
    const { allowed, remainingAttempts } =
      giftAcceptanceRateLimiter.check(rateLimitKey);

    if (!allowed) {
      toast.error("Too many attempts", {
        description: "Please wait a few minutes before trying again.",
      });
      setShowConfirmDialog(false);
      return;
    }

    setIsAccepting(true);
    try {
      const response = await giftApi.acceptCartItemGift(cartItemId, email);

      toast.success("Gift accepted successfully!", {
        description: "The item has been added to your library.",
      });

      // Reset rate limit on success
      giftAcceptanceRateLimiter.reset(rateLimitKey);

      if (response.redirectUrl) {
        router.push(response.redirectUrl);
      } else {
        router.push("/customer/dashboard");
      }
    } catch (err) {
      console.error("Error accepting gift:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Please try again later";

      if (remainingAttempts > 0) {
        toast.error("Failed to accept gift", {
          description: `${errorMessage} (${remainingAttempts} attempts remaining)`,
        });
      } else {
        toast.error("Failed to accept gift", {
          description: "Too many failed attempts. Please try again later.",
        });
      }
    } finally {
      setIsAccepting(false);
      setShowConfirmDialog(false);
    }
  };

  const canAcceptGift = () => {
    if (!gift || !session) return false;
    // Gift must be pending (not accepted yet)
    if (gift.giftAccepted === true) return false;
    // Check email match if recipientEmail is set
    if (gift.recipientEmail && gift.recipientEmail !== session.user?.email)
      return false;
    return true;
  };

  const isGiftPending = gift && !gift.giftAccepted;
  const isGiftAccepted = gift && gift.giftAccepted === true;

  if (!email) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Invalid gift link. Email parameter is required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
      <div className="container mx-auto px-4 py-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Gift not found. Please check your link and try again."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const returnUrl = `/gifts/bundles/${cartItemId}?email=${encodeURIComponent(email)}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Welcome message for non-authenticated users */}
        {!session && isGiftPending && (
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-3xl font-bold">
              You&apos;ve received a gift! 🎁
            </h1>
            <p className="text-lg text-muted-foreground">
              {gift.giftedByCustomerName} has sent you something special
            </p>
          </div>
        )}

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
            {sessionStatus === "loading" ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !session ? (
              <div className="mt-6">
                <GiftAuthPrompt
                  recipientEmail={gift.recipientEmail || email || ""}
                  hasAccount={gift.recipientHasAccount || false}
                  returnUrl={returnUrl}
                  giftTitle={gift.snapshotTitle}
                />
              </div>
            ) : canAcceptGift() ? (
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={isAccepting}
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
              disabled={isAccepting}
            >
              {isAccepting ? (
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
