"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check, Loader2, AlertCircle, Gamepad2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { toast } from "sonner";
import { giftApi } from "@/lib/api";
import { SteamKeyGift } from "@/lib/api/types/gift";
import { GiftDetailsCard } from "@/app/(public)/components/gift-details-card";
import { AuthPrompt } from "@/app/(public)/components/auth-prompt";
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

export default function SteamKeyGiftPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const assignmentId = params.assignmentId as string;
  const email = searchParams.get("email");

  const [gift, setGift] = useState<SteamKeyGift | null>(null);
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

    fetchGiftDetails();
  }, [assignmentId, email]);

  const fetchGiftDetails = async () => {
    if (!email) return;

    try {
      setIsLoading(true);
      const giftData = await giftApi.getSteamKeyGift(assignmentId, email);
      setGift(giftData);
    } catch (err) {
      console.error("Error fetching gift:", err);
      setError(err instanceof Error ? err.message : "Failed to load gift details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptGift = async () => {
    if (!email || !gift) return;

    // Check rate limit
    const rateLimitKey = `gift-accept:${assignmentId}:${email}`;
    const { allowed, remainingAttempts } = giftAcceptanceRateLimiter.check(rateLimitKey);
    
    if (!allowed) {
      toast.error("Too many attempts", {
        description: "Please wait a few minutes before trying again.",
      });
      setShowConfirmDialog(false);
      return;
    }

    setIsAccepting(true);
    try {
      const response = await giftApi.acceptSteamKeyGift(assignmentId, email);
      
      toast.success("Steam key gift accepted!", {
        description: "The game has been added to your keys library.",
      });

      // Reset rate limit on success
      giftAcceptanceRateLimiter.reset(rateLimitKey);

      if (response.redirectUrl) {
        router.push(response.redirectUrl);
      } else {
        router.push("/customer/keys");
      }
    } catch (err) {
      console.error("Error accepting gift:", err);
      const errorMessage = err instanceof Error ? err.message : "Please try again later";
      
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
    if (gift.status !== "Pending") return false;
    if (gift.recipientEmail !== session.user?.email) return false;
    return true;
  };

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

  const returnUrl = `/gifts/steam-keys/${assignmentId}?email=${encodeURIComponent(email)}`;

  // Additional info for Steam key gifts
  const additionalInfo = (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Gamepad2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Game Details</span>
      </div>
      
      <div className="grid gap-2 text-sm">
        {gift.steamGameMetadata?.developers && gift.steamGameMetadata.developers.length > 0 && (
          <div>
            <span className="text-muted-foreground">Developer:</span>{" "}
            {gift.steamGameMetadata.developers.map(d => d.name).join(", ")}
          </div>
        )}
        
        {gift.steamGameMetadata?.publishers && gift.steamGameMetadata.publishers.length > 0 && (
          <div>
            <span className="text-muted-foreground">Publisher:</span>{" "}
            {gift.steamGameMetadata.publishers.map(p => p.name).join(", ")}
          </div>
        )}
        
        {gift.steamGameMetadata?.releaseDate && (
          <div>
            <span className="text-muted-foreground">Release Date:</span>{" "}
            {new Date(gift.steamGameMetadata.releaseDate.date).toLocaleDateString()}
          </div>
        )}
        
        {gift.steamGameMetadata?.platforms && gift.steamGameMetadata.platforms.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Platforms:</span>
            <div className="flex gap-1">
              {gift.steamGameMetadata.platforms.map(platform => (
                <Badge key={platform} variant="secondary" className="text-xs">
                  {platform}
                </Badge>
              ))}
            </div>
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
          title={gift.productTitle}
          description={gift.productDescription}
          imageUrl={gift.productImageUrl}
          bundleName={gift.bundleName}
          giftedByName={gift.giftedByCustomerName}
          giftMessage={gift.giftMessage}
          createdAt={gift.createdAt}
          expiresAt={gift.expiresAt}
          status={gift.status}
          additionalInfo={additionalInfo}
        />

        {/* Authentication or Accept Button */}
        {gift.status === "Pending" && (
          <>
            {sessionStatus === "loading" ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !session ? (
              <AuthPrompt
                recipientEmail={gift.recipientEmail}
                hasAccount={gift.recipientHasAccount}
                returnUrl={returnUrl}
              />
            ) : canAcceptGift() ? (
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={isAccepting}
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

        {gift.status === "Accepted" && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              This gift has already been accepted. You can find the key in your Steam keys library.
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