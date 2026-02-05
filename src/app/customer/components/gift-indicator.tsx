"use client";

import {
  Gift,
  Send,
  Loader2,
  Mail,
  CheckCircle,
  Clock,
  Copy,
  Link2,
  XCircle,
  RotateCcw,
  DollarSign,
  Package,
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
import { Input } from "@/app/(shared)/components/ui/input";
import { Textarea } from "@/app/(shared)/components/ui/textarea";
import { Label } from "@/app/(shared)/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogOverlay,
  AlertDialogPortal,
} from "@/app/(shared)/components/ui/alert-dialog";
import { toast } from "sonner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";
import { giftApi } from "@/lib/api";
import { CartItem, CartItemStatus } from "@/lib/api/types/cart";
import { useQueryClient } from "@tanstack/react-query";
import { useExpiredGiftActions } from "@/hooks/queries/useGifts";

dayjs.extend(relativeTime);

// Helper function to format deadline with relative time
function formatDeadline(deadline: string): string {
  const deadlineDate = dayjs(deadline);
  const now = dayjs();
  const daysLeft = deadlineDate.diff(now, "day");

  if (daysLeft < 0) {
    return `Expired on ${deadlineDate.format("MMM D, YYYY [at] h:mm A")}`;
  } else if (daysLeft === 0) {
    return `Today at ${deadlineDate.format("h:mm A")}`;
  } else if (daysLeft === 1) {
    return `Tomorrow (${deadlineDate.format("MMM D [at] h:mm A")})`;
  } else if (daysLeft <= 7) {
    return `In ${daysLeft} days (${deadlineDate.format("MMM D [at] h:mm A")})`;
  } else {
    return `${deadlineDate.format("MMM D, YYYY [at] h:mm A")} (${deadlineDate.fromNow()})`;
  }
}

interface GiftIndicatorProps {
  cartItem: CartItem | null;
}

// Helper function to check if gift was returned (not accepted in time)
function isGiftExpired(cartItem: CartItem): boolean {
  // Gift is returned if it was not accepted (giftAccepted == false/null)
  // Note: For CartItems, we check both giftExpiresAt date AND acceptance status
  if (!cartItem.giftExpiresAt) return false;
  const now = new Date();
  const expiresAt = new Date(cartItem.giftExpiresAt);
  return now > expiresAt;
}

export function GiftIndicator({ cartItem }: GiftIndicatorProps) {
  if (!cartItem?.isGift) return null;

  const Icon = Send;
  const isExpired = !cartItem.giftAccepted && isGiftExpired(cartItem);

  // For outgoing gifts, show recipient or "by link"
  const recipient = cartItem.giftRecipientName ?? cartItem.giftRecipientEmail;
  const label = isExpired
    ? "Gift Returned"
    : recipient
      ? `Gifted to ${recipient}`
      : "Gifted by link";
  const isLinkGift = !recipient;

  // Badge styling based on acceptance status
  const badgeClassName = isExpired
    ? "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800"
    : cartItem.giftAccepted === true
      ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800"
      : "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800";

  // Always use compact variant with dialog
  return (
    <>
      <GiftDetailsDialog cartItem={cartItem}>
        <Badge
          className={`inline-flex items-center gap-1 cursor-pointer transition-colors w-fit ${badgeClassName}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Icon className="h-3 w-3" />
          <span className="text-xs">{label}</span>
          {isExpired && <XCircle className="h-3 w-3" />}
          {!isExpired && isLinkGift && <Link2 className="h-3 w-3" />}
          {!isExpired && !isLinkGift && cartItem.giftAccepted === true && (
            <CheckCircle className="h-3 w-3" />
          )}
          {!isExpired && !isLinkGift && cartItem.giftAccepted !== true && (
            <Clock className="h-3 w-3" />
          )}
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
  const [resendDialogOpen, setResendDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newRecipientEmail, setNewRecipientEmail] = useState("");
  const [newRecipientName, setNewRecipientName] = useState("");
  const [newGiftMessage, setNewGiftMessage] = useState("");
  const queryClient = useQueryClient();

  const isExpired = !cartItem.giftAccepted && isGiftExpired(cartItem);
  const canTakeAction = cartItem.status === CartItemStatus.Completed;
  const isRefunded = cartItem.status === CartItemStatus.Refunded;

  // Fetch expired gift actions when dialog opens and gift is expired
  const { data: giftActions, isLoading: isLoadingActions } =
    useExpiredGiftActions(
      cartItem.id,
      dialogOpen && isExpired && canTakeAction,
    );

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

  const handleResendExpiredGift = async () => {
    if (!newRecipientEmail) {
      toast.error("Email required", {
        description: "Please enter a recipient email address",
      });
      return;
    }

    // Validate gift message length (max 500 chars)
    if (newGiftMessage && newGiftMessage.length > 500) {
      toast.error("Message too long", {
        description: "Gift message must be 500 characters or less",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await giftApi.changeGiftRecipient(
        cartItem.id,
        newRecipientEmail,
        newRecipientName || undefined,
        newGiftMessage || undefined,
      );

      toast.success("Gift resent!", {
        description:
          response.message || "The gift has been resent to the new recipient",
      });

      setResendDialogOpen(false);
      setNewRecipientEmail("");
      setNewRecipientName("");
      setNewGiftMessage("");

      // Refresh purchases list
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    } catch (err) {
      console.error("Error resending gift:", err);
      toast.error("Failed to resend gift", {
        description:
          err instanceof Error ? err.message : "Please try again later",
      });
      // Reopen main dialog on error
      setTimeout(() => setDialogOpen(true), 100);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestRefund = async () => {
    setIsProcessing(true);
    try {
      const response = await giftApi.requestRefundForGift(cartItem.id);

      toast.success("Refund requested!", {
        description:
          response.message ||
          "Your refund request has been submitted and will be processed within 3-5 business days",
      });

      setRefundDialogOpen(false);

      // Refresh purchases list
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    } catch (err) {
      console.error("Error requesting refund:", err);
      toast.error("Failed to request refund", {
        description:
          err instanceof Error ? err.message : "Please try again later",
      });
      // Reopen main dialog on error
      setRefundDialogOpen(false);
      setTimeout(() => setDialogOpen(true), 100);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClaimGift = async () => {
    setIsProcessing(true);
    try {
      const response = await giftApi.claimGift(cartItem.id);

      toast.success("Gift claimed!", {
        description:
          response.message ||
          "The collection keys are now available in your library",
      });

      setClaimDialogOpen(false);

      // Refresh purchases list and library
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["steamKeys"] });
    } catch (err) {
      console.error("Error claiming gift:", err);
      toast.error("Failed to claim gift", {
        description:
          err instanceof Error ? err.message : "Please try again later",
      });
      // Reopen main dialog on error
      setClaimDialogOpen(false);
      setTimeout(() => setDialogOpen(true), 100);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyGiftLink = async () => {
    const giftLink = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/gifts/collections/${cartItem.id}`;

    try {
      await navigator.clipboard.writeText(giftLink);
      toast.success("Gift link copied!", {
        description: "The gift link has been copied to your clipboard",
      });
    } catch (err) {
      console.error("Error copying gift link:", err);
      toast.error("Failed to copy link", {
        description: "Please try again",
      });
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isExpired ? (
              <>
                <XCircle className="h-5 w-5 text-destructive" />
                Gift Returned - Choose an Action
              </>
            ) : (
              <>
                <Gift className="h-5 w-5 text-primary" />
                Collection Gift Details
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isExpired ? (
              <>
                This gift was not claimed by the recipient and has been returned
                {cartItem.giftExpiresAt &&
                  ` on ${dayjs(cartItem.giftExpiresAt).format("MMM D, YYYY [at] h:mm A")}`}
              </>
            ) : (
              <>
                Gift sent
                {cartItem.createdAt &&
                  ` on ${dayjs(cartItem.createdAt).format("MMM D, YYYY [at] h:mm A")}`}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isExpired ? (
            <>
              {/* Original recipient info */}
              {(cartItem.giftRecipientEmail || cartItem.giftRecipientName) && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Original Recipient:
                  </p>
                  <p className="text-sm">
                    {cartItem.giftRecipientName
                      ? `${cartItem.giftRecipientName} (${cartItem.giftRecipientEmail})`
                      : cartItem.giftRecipientEmail}
                  </p>
                </div>
              )}

              {/* Original gift message */}
              {cartItem.giftMessage && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Original Message:
                  </p>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {cartItem.giftMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Show status-specific content */}
              {isRefunded ? (
                <div className="rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 p-4">
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                        Gift Refunded
                      </p>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        This gift has been refunded. The refund was processed
                        and the funds have been returned to your original
                        payment method.
                      </p>
                    </div>
                  </div>
                </div>
              ) : canTakeAction ? (
                <>
                  {isLoadingActions ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <>
                      {/* Returned gift with available actions */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-foreground">
                          Available Actions
                        </h4>

                        {/* Resend Action */}
                        <div className="rounded-lg border border-border bg-muted/30 p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="rounded-full bg-background p-2">
                              <RotateCcw className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <h5 className="font-semibold text-foreground">
                                Resend to New Recipient
                              </h5>
                              <p className="text-sm text-muted-foreground">
                                Send this gift to a different person. Available
                                until 90 days after collection end.
                              </p>
                              {giftActions?.resendDeadline && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  <strong>Deadline:</strong>{" "}
                                  {formatDeadline(giftActions.resendDeadline)}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDialogOpen(false);
                              setTimeout(() => setResendDialogOpen(true), 100);
                            }}
                            className="w-full"
                            disabled={!giftActions?.canResend}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Resend Gift
                          </Button>
                        </div>

                        {/* Refund Action */}
                        <div className="rounded-lg border border-border bg-muted/30 p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="rounded-full bg-background p-2">
                              <DollarSign className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <h5 className="font-semibold text-foreground">
                                Request Refund
                              </h5>
                              <p className="text-sm text-muted-foreground">
                                Get your money back. Available until 14 days
                                after collection end.
                              </p>
                              {giftActions?.refundDeadline && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  <strong>Deadline:</strong>{" "}
                                  {formatDeadline(giftActions.refundDeadline)}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDialogOpen(false);
                              setTimeout(() => setRefundDialogOpen(true), 100);
                            }}
                            className="w-full"
                            disabled={!giftActions?.canRefund}
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Request Refund
                          </Button>
                        </div>

                        {/* Claim Action */}
                        <div className="rounded-lg border border-border bg-muted/30 p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="rounded-full bg-background p-2">
                              <Package className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <h5 className="font-semibold text-foreground">
                                Claim for Yourself
                              </h5>
                              <p className="text-sm text-muted-foreground">
                                Add the keys to your own library. Only available
                                until 90 days after collection end and you
                                haven't purchased this collection for yourself.
                              </p>
                              {giftActions?.cannotClaimReason && (
                                <p className="text-xs text-destructive mt-2">
                                  <strong>Not available:</strong>{" "}
                                  {giftActions.cannotClaimReason}
                                </p>
                              )}
                              {giftActions?.claimDeadline &&
                                !giftActions?.cannotClaimReason && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    <strong>Deadline:</strong>{" "}
                                    {formatDeadline(giftActions.claimDeadline)}
                                  </p>
                                )}
                            </div>
                          </div>
                          <Button
                            variant="default"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDialogOpen(false);
                              setTimeout(() => setClaimDialogOpen(true), 100);
                            }}
                            className="w-full"
                            disabled={!giftActions?.canClaim}
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Claim Gift
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="rounded-lg bg-muted border p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        No Actions Available
                      </p>
                      <p className="text-sm text-muted-foreground">
                        This gift has been returned and no further actions can
                        be taken at this time.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Active gift content */}
              {/* Gift recipient info - only show for email gifts */}
              {(cartItem.giftRecipientEmail || cartItem.giftRecipientName) && (
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      To:
                    </span>
                    <span className="text-sm">
                      {cartItem.giftRecipientName
                        ? `${cartItem.giftRecipientName} (${cartItem.giftRecipientEmail})`
                        : cartItem.giftRecipientEmail}
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
              )}

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

              {/* Gift Link - Only show for active gifts */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Gift Link:
                </p>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <code className="text-xs flex-1 break-all select-all">
                    {`${process.env.NEXT_PUBLIC_APP_BASE_URL}/gifts/collections/${cartItem.id}`}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyGiftLink}
                    className="gap-1 shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>

              {/* Action buttons for active gifts */}
              <div className="flex justify-end gap-2 mt-4">
                {/* Resend button for pending (non-expired) outgoing gifts with email */}
                {!cartItem.giftAccepted && cartItem.giftRecipientEmail && (
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
            </>
          )}
        </div>
      </DialogContent>

      {/* Resend Gift Dialog */}
      <AlertDialog open={resendDialogOpen} onOpenChange={setResendDialogOpen}>
        <AlertDialogContent
          onClick={(e) => e.stopPropagation()}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-primary" />
              Resend Gift to New Recipient
            </AlertDialogTitle>
            <AlertDialogDescription>
              Since the original recipient didn&apos;t claim this gift, you can
              send it to someone else. Enter the new recipient&apos;s details
              below.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Warning if expiring soon (less than 7 days) */}
          {cartItem.expiresAt && dayjs(cartItem.expiresAt).diff(dayjs(), 'day') < 7 && (
            <div className="rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 p-3 space-y-1">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-orange-900 dark:text-orange-100">
                    Expiring Soon
                  </p>
                  <p className="text-orange-700 dark:text-orange-300">
                    This gift will expire on {formatDeadline(cartItem.expiresAt)} as the purchase expiration period ends then. The new recipient will need to claim it before this date.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Recipient Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="friend@example.com"
                value={newRecipientEmail}
                onChange={(e) => setNewRecipientEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Recipient Name (Optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Friend's Name"
                value={newRecipientName}
                onChange={(e) => setNewRecipientName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Gift Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a personal message..."
                value={newGiftMessage}
                onChange={(e) => setNewGiftMessage(e.target.value)}
                maxLength={500}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {newGiftMessage.length}/500 characters
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleResendExpiredGift();
              }}
              disabled={isProcessing || !newRecipientEmail}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                "Send Gift"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Refund Dialog */}
      <AlertDialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <AlertDialogContent
          onClick={(e) => e.stopPropagation()}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Request Refund
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Request a refund for this unclaimed gift. Refunds are available
                for up to 14 days after the collection end time.
              </p>
              <div className="rounded-lg bg-muted p-3 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  How it works:
                </p>
                <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Refunds are processed within 3-5 business days</li>
                  <li>You will receive a confirmation email once processed</li>
                  <li>
                    If the refund period has expired, the backend will inform
                    you
                  </li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                Note: If you&apos;re outside the refund window, you can still
                resend this gift to someone else or claim it for yourself.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleRequestRefund();
              }}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Request Refund"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Claim Gift Dialog */}
      <AlertDialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
        <AlertDialogContent
          onClick={(e) => e.stopPropagation()}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Claim Gift for Yourself
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Since this gift was not claimed by the recipient, you can claim
                it for yourself.
              </p>
              <p className="font-medium text-foreground">
                Collection: {cartItem.snapshotTitle || "Unknown Collection"}
              </p>
              <p className="text-sm">
                Once claimed, the game keys will be added to your library and
                will be available in the Games Library section. This action
                cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleClaimGift();
              }}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Claiming...
                </>
              ) : (
                "Claim Gift"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
