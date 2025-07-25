"use client";

import { Gift, Send, MessageSquare, Check, Loader2 } from "lucide-react";
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
  onGiftAccepted,
}: GiftIndicatorProps) {
  if (!isGift) return null;

  const isReceived = !!giftedByCustomerName;
  const isOutgoing = !!giftRecipientEmail || !!giftRecipientName;
  const Icon = isReceived ? Gift : Send;

  let label = "Gift";
  if (isReceived) {
    label = `By ${giftedByCustomerName}`;
  } else if (isOutgoing) {
    const recipient = giftRecipientName || giftRecipientEmail || "someone";
    label = `To ${recipient}`;
  }

  const badgeVariant = isReceived ? "default" : "secondary";

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2">
        <Badge variant={badgeVariant} className="flex items-center gap-1">
          <Icon className="h-3 w-3" />
          <span className="text-xs">{label}</span>
        </Badge>
        {(giftMessage || isOutgoing) && (
          <GiftDetailsDialog
            message={giftMessage}
            giftedAt={giftedAt}
            isReceived={isReceived}
            giftedByCustomerName={giftedByCustomerName}
            giftRecipientEmail={giftRecipientEmail}
            giftRecipientName={giftRecipientName}
            giftAccepted={giftAccepted}
            giftAcceptedAt={giftAcceptedAt}
            cartItemId={cartItemId}
            recipientEmail={giftRecipientEmail}
            onGiftAccepted={onGiftAccepted}
          />
        )}
      </div>
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
      {(giftMessage || isOutgoing) && (
        <div className="mt-1">
          <GiftDetailsDialog
            message={giftMessage}
            giftedAt={giftedAt}
            isReceived={isReceived}
            giftedByCustomerName={giftedByCustomerName}
            giftRecipientEmail={giftRecipientEmail}
            giftRecipientName={giftRecipientName}
            giftAccepted={giftAccepted}
            giftAcceptedAt={giftAcceptedAt}
            cartItemId={cartItemId}
            recipientEmail={giftRecipientEmail}
            onGiftAccepted={onGiftAccepted}
            trigger={
              <Button variant="ghost" size="sm" className="h-auto p-1 text-xs">
                <MessageSquare className="h-3 w-3 mr-1" />
                View details
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}

interface GiftDetailsDialogProps {
  message?: string;
  giftedAt?: string;
  isReceived: boolean;
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
  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MessageSquare className="h-3 w-3" />
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
              {!isReceived && (giftRecipientName || giftRecipientEmail) && (
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    To:
                  </span>
                  <span className="text-sm">
                    {giftRecipientName || giftRecipientEmail}
                  </span>
                </div>
              )}
              {!isReceived && giftAccepted !== undefined && (
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Status:
                  </span>
                  <span className="text-sm">
                    {giftAccepted === true
                      ? `Accepted${giftAcceptedAt ? ` on ${dayjs(giftAcceptedAt).format("MMM D, YYYY")}` : ""}`
                      : giftAccepted === false
                        ? "Not accepted yet"
                        : "Pending acceptance"}
                  </span>
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

            {/* Accept button for pending received gifts */}
            {isReceived &&
              cartItemId &&
              recipientEmail &&
              giftAccepted === false && (
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={isAccepting}
                    className="gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Accept Gift
                  </Button>
                </div>
              )}
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
