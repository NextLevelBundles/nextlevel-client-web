"use client";

import {
  Gift,
  Send,
  Check,
  Loader2,
  Mail,
  CheckCircle,
  Clock,
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
import { useState } from "react";
import { giftApi } from "@/lib/api";

interface GiftIndicatorProps {
  isGift?: boolean;
  giftedByCustomerName?: string;
  giftMessage?: string;
  giftedAt?: string;
  giftRecipientEmail?: string;
  giftRecipientName?: string;
  giftAccepted?: boolean | null;
  giftAcceptedAt?: string | null;
  variant?: "compact" | "detailed";
  cartItemId?: string; // For accepting the gift (cart item id)
  cartItemCustomerId?: string; // Customer ID who purchased the cart item
  currentCustomerId?: string; // Current user's customer ID
  recipientEmail?: string; // Email of the recipient (for gift acceptance)
  onGiftAccepted?: () => void; // Callback when gift is accepted
}

export function GiftIndicator({
  isGift,
  giftedByCustomerName,
  giftMessage,
  giftedAt,
  giftRecipientEmail,
  giftRecipientName,
  giftAccepted,
  giftAcceptedAt,
  variant = "compact",
  cartItemId,
  cartItemCustomerId,
  currentCustomerId,
  recipientEmail,
  onGiftAccepted,
}: GiftIndicatorProps) {
  if (!isGift) return null;

  // Determine if gift is outgoing or incoming based on customerId
  const isOutgoing = cartItemCustomerId === currentCustomerId;
  const isReceived = !isOutgoing;
  const Icon = isReceived ? Gift : Send;

  let label = "Gift";
  let badgeClassName = "";
  
  if (isReceived) {
    if (giftedByCustomerName) {
      label = `From ${giftedByCustomerName}`;
    } else {
      label = "Received Gift";
    }
    if (giftAccepted === true) {
      badgeClassName = "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800";
    } else {
      badgeClassName = "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30 border-amber-200 dark:border-amber-800";
    }
  } else if (isOutgoing) {
    const recipient = giftRecipientName || giftRecipientEmail || "someone";
    label = `To ${recipient}`;
    if (giftAccepted === true) {
      badgeClassName = "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800";
    } else {
      badgeClassName = "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800";
    }
  }

  if (variant === "compact") {
    return (
      <GiftDetailsDialog
        message={giftMessage}
        giftedAt={giftedAt}
        isReceived={isReceived}
        isOutgoing={isOutgoing}
        giftedByCustomerName={giftedByCustomerName}
        giftRecipientEmail={giftRecipientEmail}
        giftRecipientName={giftRecipientName}
        giftAccepted={giftAccepted}
        giftAcceptedAt={giftAcceptedAt}
        cartItemId={cartItemId}
        recipientEmail={recipientEmail}
        onGiftAccepted={onGiftAccepted}
        trigger={
          <Badge 
            className={`inline-flex items-center gap-1 cursor-pointer transition-colors w-fit ${badgeClassName}`}
          >
            <Icon className="h-3 w-3" />
            <span className="text-xs">{label}</span>
            {giftAccepted === true && <CheckCircle className="h-3 w-3" />}
            {giftAccepted === false && <Clock className="h-3 w-3" />}
          </Badge>
        }
      />
    );
  }

  // Detailed variant for larger displays
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-sm">
          <Icon className="h-4 w-4 text-primary" />
          <span className="font-medium">
            {isReceived ? "Gift from" : "Sent as gift"}
          </span>
        </div>
        {isReceived && (
          <span className="text-sm text-muted-foreground">
            {giftedByCustomerName}
          </span>
        )}
      </div>
      {giftedAt && (
        <span className="text-xs text-muted-foreground">
          {dayjs(giftedAt).format("MMM D, YYYY")}
        </span>
      )}
      <div className="mt-1">
        <GiftDetailsDialog
          message={giftMessage}
          giftedAt={giftedAt}
          isReceived={isReceived}
          isOutgoing={isOutgoing}
          giftedByCustomerName={giftedByCustomerName}
          giftRecipientEmail={giftRecipientEmail}
          giftRecipientName={giftRecipientName}
          giftAccepted={giftAccepted}
          giftAcceptedAt={giftAcceptedAt}
          cartItemId={cartItemId}
          recipientEmail={recipientEmail}
          onGiftAccepted={onGiftAccepted}
          trigger={
            <Badge 
              className={`inline-flex items-center gap-1 cursor-pointer transition-colors w-fit ${badgeClassName}`}
            >
              <Gift className="h-3 w-3" />
              <span className="text-xs">View details</span>
              {giftAccepted === true && <CheckCircle className="h-3 w-3" />}
              {giftAccepted === false && <Clock className="h-3 w-3" />}
            </Badge>
          }
        />
      </div>
    </div>
  );
}

interface GiftDetailsDialogProps {
  message?: string;
  giftedAt?: string;
  isReceived: boolean;
  isOutgoing: boolean;
  giftedByCustomerName?: string;
  giftRecipientEmail?: string;
  giftRecipientName?: string;
  giftAccepted?: boolean | null;
  giftAcceptedAt?: string | null;
  trigger?: React.ReactNode;
  cartItemId?: string;
  recipientEmail?: string;
  onGiftAccepted?: () => void;
}

function GiftDetailsDialog({
  message,
  giftedAt,
  isReceived,
  isOutgoing,
  giftedByCustomerName,
  giftRecipientEmail,
  giftRecipientName,
  giftAccepted,
  giftAcceptedAt,
  trigger,
  cartItemId,
  recipientEmail,
  onGiftAccepted,
}: GiftDetailsDialogProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleAcceptGift = async () => {
    if (!cartItemId || !recipientEmail) return;

    setIsAccepting(true);
    try {
      // Note: This assumes we have an API endpoint for accepting purchase gifts
      // You may need to implement this endpoint or adjust based on your API
      await giftApi.acceptCartItemGift(cartItemId, recipientEmail);

      toast.success("Gift accepted successfully!", {
        description: "The items have been added to your library.",
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
    if (!cartItemId) return;

    setIsResending(true);
    try {
      const response = await giftApi.resendPurchaseGiftEmail(cartItemId);

      toast.success("Email sent!", {
        description:
          response.message ||
          "Gift notification has been resent to the recipient",
      });
    } catch (err) {
      console.error("Error resending email:", err);
    } finally {
      setIsResending(false);
    }
  };
  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Gift className="h-3 w-3" />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Gift Details
            </DialogTitle>
            <DialogDescription>
              {isReceived ? "Gift received" : "Gift sent"}
              {giftedAt && ` on ${dayjs(giftedAt).format("MMMM D, YYYY")}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Gift sender/recipient info */}
            <div className="space-y-2">
              {isReceived && giftedByCustomerName && (
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    From:
                  </span>
                  <span className="text-sm">{giftedByCustomerName}</span>
                </div>
              )}
              {isOutgoing && (giftRecipientName || giftRecipientEmail) && (
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    To:
                  </span>
                  <span className="text-sm">
                    {giftRecipientName || giftRecipientEmail}
                  </span>
                </div>
              )}
              {isOutgoing && giftAccepted !== undefined && (
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Status:
                  </span>
                  <div className="flex items-center gap-2">
                    {giftAccepted === true ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">
                          Accepted
                          {giftAcceptedAt
                            ? ` on ${dayjs(giftAcceptedAt).format("MMM D, YYYY")}`
                            : ""}
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span className="text-sm text-amber-600">
                          Pending acceptance
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
              {isReceived && giftAccepted !== undefined && (
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Status:
                  </span>
                  <div className="flex items-center gap-2">
                    {giftAccepted === true ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">
                          Accepted
                          {giftAcceptedAt
                            ? ` on ${dayjs(giftAcceptedAt).format("MMM D, YYYY")}`
                            : ""}
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span className="text-sm text-amber-600">
                          Not accepted yet
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Gift message */}
            {message && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {isReceived && giftedByCustomerName
                    ? `${giftedByCustomerName} said:`
                    : "Message:"}
                </p>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{message}</p>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-2 mt-4">
              {/* Resend button for pending outgoing gifts */}
              {isOutgoing && cartItemId && !giftAccepted && (
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
                      Resend Email
                    </>
                  )}
                </Button>
              )}

              {/* Accept button for pending received gifts */}
              {isReceived && cartItemId && recipientEmail && !giftAccepted && (
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
    </>
  );
}
