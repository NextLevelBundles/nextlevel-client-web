"use client";

import { Gift, Send, MessageSquare } from "lucide-react";
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
import dayjs from "dayjs";

interface GiftIndicatorProps {
  isGift?: boolean;
  giftedByCustomerName?: string;
  giftMessage?: string;
  giftedAt?: string;
  variant?: "compact" | "detailed";
}

export function GiftIndicator({
  isGift,
  giftedByCustomerName,
  giftMessage,
  giftedAt,
  variant = "compact",
}: GiftIndicatorProps) {
  if (!isGift) return null;

  const isReceived = !!giftedByCustomerName;
  const Icon = isReceived ? Gift : Send;
  const label = isReceived ? `From ${giftedByCustomerName}` : "Gifted";
  const badgeVariant = isReceived ? "default" : "secondary";

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2">
        <Badge variant={badgeVariant} className="flex items-center gap-1">
          <Icon className="h-3 w-3" />
          <span className="text-xs">{label}</span>
        </Badge>
        {giftMessage && <GiftMessageDialog message={giftMessage} giftedAt={giftedAt} />}
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
      {giftMessage && (
        <div className="mt-1">
          <GiftMessageDialog 
            message={giftMessage} 
            giftedAt={giftedAt}
            trigger={
              <Button variant="ghost" size="sm" className="h-auto p-1 text-xs">
                <MessageSquare className="h-3 w-3 mr-1" />
                View message
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}

interface GiftMessageDialogProps {
  message: string;
  giftedAt?: string;
  trigger?: React.ReactNode;
}

function GiftMessageDialog({ message, giftedAt, trigger }: GiftMessageDialogProps) {
  return (
    <Dialog>
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
            Gift Message
          </DialogTitle>
          {giftedAt && (
            <DialogDescription>
              Received on {dayjs(giftedAt).format("MMMM D, YYYY")}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm whitespace-pre-wrap">{message}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}