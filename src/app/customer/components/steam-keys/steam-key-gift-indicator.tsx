"use client";

import {
  Gift,
  Send,
  Check,
  Loader2,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/app/(shared)/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/(shared)/components/ui/dialog";
import { Button } from "@/app/(shared)/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/(shared)/components/ui/alert-dialog";
import { toast } from "sonner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";

dayjs.extend(relativeTime);
import { giftApi } from "@/lib/api";
import { SteamKeyAssignment } from "@/lib/api/types/steam-key";
import Link from "next/link";

interface SteamKeyGiftIndicatorProps {
  steamKey: SteamKeyAssignment;
  currentCustomerId?: string;
  onGiftAccepted?: () => void;
}

export function SteamKeyGiftIndicator({
  steamKey,
  currentCustomerId,
  onGiftAccepted,
}: SteamKeyGiftIndicatorProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isResending, setIsResending] = useState(false);

  if (!steamKey.isGift) return null;

  // Determine if current user is the gifter or receiver
  // Current user is the gifter if their customerId matches giftedByCustomerId
  const isGifter = steamKey.giftedByCustomerId === currentCustomerId;
  const isReceiver = !isGifter;
  const Icon = isReceiver ? Gift : Send;

  let label = "Gift";
  let badgeClassName = "";

  if (isReceiver) {
    // Current user received this gift - show "From [gifter name]"
    if (steamKey.giftedByCustomerName) {
      label = `From ${steamKey.giftedByCustomerName}`;
    } else {
      label = "Received Gift";
    }
    if (steamKey.giftAccepted === true) {
      badgeClassName =
        "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800";
    } else {
      badgeClassName =
        "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30 border-amber-200 dark:border-amber-800";
    }
  } else if (isGifter) {
    // Current user gifted this key - show "To [recipient name]"
    const recipient =
      steamKey.giftRecipientName || steamKey.giftRecipientEmail || "someone";
    label = `To ${recipient}`;
    if (steamKey.giftAccepted === true) {
      badgeClassName =
        "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800";
    } else {
      badgeClassName =
        "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800";
    }
  }

  const handleAcceptGift = async () => {
    if (!steamKey.id) return;

    setIsAccepting(true);
    try {
      await giftApi.acceptSteamKeyGift(steamKey.id);

      toast.success("Gift accepted successfully!", {
        description: "The game key has been added to your library.",
      });

      setShowConfirmDialog(false);
      setDialogOpen(false);

      if (onGiftAccepted) {
        onGiftAccepted();
      }
    } catch (err) {
      console.error("Error accepting gift:", err);
      toast.error("Failed to accept gift", {
        description:
          err instanceof Error ? err.message : "Please try again later",
      });
    } finally {
      setIsAccepting(false);
      setShowConfirmDialog(false);
    }
  };

  const handleResendEmail = async () => {
    if (!steamKey.id) return;

    setIsResending(true);
    try {
      const response = await giftApi.resendSteamKeyGiftEmail(steamKey.id);

      toast.success("Email sent!", {
        description:
          response.message ||
          "Gift notification has been resent to the recipient",
      });
    } catch (err) {
      console.error("Error resending email:", err);
      toast.error("Failed to resend email", {
        description:
          err instanceof Error ? err.message : "Please try again later",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Badge
            className={`inline-flex items-center gap-1 cursor-pointer transition-colors w-fit ${badgeClassName}`}
          >
            <Icon className="h-3 w-3" />
            <span className="text-xs">{label}</span>
            {steamKey.giftAccepted === true && (
              <CheckCircle className="h-3 w-3" />
            )}
            {steamKey.giftAccepted === false && <Clock className="h-3 w-3" />}
          </Badge>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Steam Key Gift Details
            </DialogTitle>
            <DialogDescription>
              {isReceiver ? "Gift received" : "Gift sent"}
              {steamKey.giftedAt &&
                ` on ${dayjs(steamKey.giftedAt).format("MMM D, YYYY [at] h:mm A")}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Product info */}
            <div className="flex items-start gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Game:
              </span>
              <span className="text-sm font-medium">{steamKey.title}</span>
            </div>

            {/* Gift sender/recipient info */}
            <div className="space-y-2">
              {isReceiver && steamKey.giftedByCustomerName && (
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    From:
                  </span>
                  <span className="text-sm">
                    {steamKey.giftedByCustomerName}
                  </span>
                </div>
              )}
              {isGifter &&
                (steamKey.giftRecipientName || steamKey.giftRecipientEmail) && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      To:
                    </span>
                    <span className="text-sm">
                      {steamKey.giftRecipientName ||
                        steamKey.giftRecipientEmail}
                    </span>
                  </div>
                )}

              {/* Status */}
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Status:
                </span>
                <div className="flex flex-col gap-1">
                  {steamKey.giftAccepted === true ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">
                        Accepted
                        {steamKey.giftAcceptedAt
                          ? ` on ${dayjs(steamKey.giftAcceptedAt).format("MMM D, YYYY [at] h:mm A")}`
                          : ""}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span className="text-sm text-amber-600 font-medium">
                          {isReceiver
                            ? "Not accepted yet"
                            : "Pending acceptance"}
                        </span>
                      </div>
                      {/* Show expiration info for pending gifts */}
                      {steamKey.giftExpiresAt && (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                          <span className="text-xs text-muted-foreground">
                            {isGifter
                              ? "Gift Expires on"
                              : "You must accept by"}{" "}
                            {dayjs(steamKey.giftExpiresAt).format(
                              "MMM D, YYYY [at] h:mm A"
                            )}{" "}
                            ({dayjs(steamKey.giftExpiresAt).fromNow()})
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Gift message */}
            {steamKey.giftMessage && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {isReceiver && steamKey.giftedByCustomerName
                    ? `${steamKey.giftedByCustomerName} said:`
                    : "Message:"}
                </p>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">
                    {steamKey.giftMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Purchase gift notice */}
            {steamKey.isPurchaseGift &&
              isReceiver &&
              !steamKey.giftAccepted && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      This key is part of a bundle gift
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Please accept the entire bundle gift in your{" "}
                      <Link
                        href="/customer/purchases"
                        className="underline hover:no-underline"
                      >
                        Purchase History
                      </Link>{" "}
                      to receive this key.
                    </p>
                  </div>
                </div>
              )}

            {/* Action buttons */}
            <div className="flex justify-end gap-2 mt-4">
              {/* Resend button for pending outgoing gifts (when user is gifter) */}
              {isGifter && steamKey.id && !steamKey.giftAccepted && (
                <Button
                  variant="outline"
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="gap-2"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Resend Steam Key Gift
                    </>
                  )}
                </Button>
              )}

              {/* Accept button for pending received gifts (only if not part of purchase gift) */}
              {isReceiver &&
                steamKey.id &&
                !steamKey.giftAccepted &&
                !steamKey.isPurchaseGift && (
                  <Button
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={isAccepting}
                    className="gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Accept Gift
                  </Button>
                )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Gift?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to accept this gift? Once accepted, the game
              key will be added to your library and cannot be transferred to
              another account.
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
    </>
  );
}
