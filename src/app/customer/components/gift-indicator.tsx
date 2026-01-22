"use client";

import { Gift, Send, Loader2, Mail, CheckCircle, Clock } from "lucide-react";
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
import { toast } from "sonner";
import dayjs from "dayjs";
import { useState } from "react";
import { giftApi } from "@/lib/api";
import { CartItem } from "@/lib/api/types/cart";

interface GiftIndicatorProps {
  cartItem: CartItem | null;
}

export function GiftIndicator({ cartItem }: GiftIndicatorProps) {
  if (!cartItem?.isGift) return null;

  const Icon = Send;

  // For outgoing gifts, show recipient
  const recipient = cartItem.giftRecipientName ?? cartItem.giftRecipientEmail;
  const label = `Gifted to ${recipient}`;

  // Badge styling based on acceptance status
  const badgeClassName =
    cartItem.giftAccepted === true
      ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800"
      : "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800";

  // Always use compact variant with dialog
  return (
    <>
      <GiftDetailsDialog cartItem={cartItem}>
        <Badge
          className={`inline-flex items-center gap-1 cursor-pointer transition-colors w-fit ${badgeClassName}`}
        >
          <Icon className="h-3 w-3" />
          <span className="text-xs">{label}</span>
          {cartItem.giftAccepted === true && (
            <CheckCircle className="h-3 w-3" />
          )}
          {cartItem.giftAccepted === false && <Clock className="h-3 w-3" />}
        </Badge>
      </GiftDetailsDialog>
    </>
  );
}

interface GiftDetailsDialogProps {
  cartItem: CartItem;
  children: React.ReactNode;
}

function GiftDetailsDialog({ cartItem, children }: GiftDetailsDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const response = await giftApi.resendCartItemGiftEmail(cartItem.id);

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
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Collection Gift Details
          </DialogTitle>
          <DialogDescription>
            Gift sent
            {cartItem.createdAt &&
              ` on ${dayjs(cartItem.createdAt).format("MMM D, YYYY [at] h:mm A")}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Gift recipient info */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                To:
              </span>
              <span className="text-sm">
                {cartItem.giftRecipientName || cartItem.giftRecipientEmail}
              </span>
            </div>

            {/* Status */}
            <div className="flex items-start gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Status:
              </span>
              <div className="flex flex-col gap-1">
                {cartItem.giftAccepted === true ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">
                      Accepted
                      {cartItem.giftAcceptedAt
                        ? ` on ${dayjs(cartItem.giftAcceptedAt).format("MMM D, YYYY [at] h:mm A")}`
                        : ""}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="text-sm text-amber-600 font-medium">
                      Pending acceptance
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Gift message */}
          {cartItem.giftMessage && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Message:
              </p>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm whitespace-pre-wrap">
                  {cartItem.giftMessage}
                </p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-2 mt-4">
            {/* Resend button for pending outgoing gifts */}
            {!cartItem.giftAccepted && (
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
                    Resend Gift Email
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
