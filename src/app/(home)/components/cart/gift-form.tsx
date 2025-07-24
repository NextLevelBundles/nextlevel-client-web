"use client";

import { useState, useEffect, useRef } from "react";
import { Gift, AlertCircle } from "lucide-react";
import { Button } from "@/app/(shared)/components/ui/button";
import { Input } from "@/app/(shared)/components/ui/input";
import { Label } from "@/app/(shared)/components/ui/label";
import { Textarea } from "@/app/(shared)/components/ui/textarea";
import { Switch } from "@/app/(shared)/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/(shared)/components/ui/collapsible";
import { Alert, AlertDescription } from "@/app/(shared)/components/ui/alert";
import { CartItem } from "@/lib/api/types/cart";

interface GiftFormProps {
  item: CartItem;
  onGiftUpdate: (
    itemId: string,
    giftData: {
      isGift: boolean;
      giftRecipientEmail?: string;
      giftRecipientName?: string;
      giftMessage?: string;
    }
  ) => Promise<void>;
  isUpdating?: boolean;
}

const GIFT_MESSAGE_LIMIT = 500;

export function GiftForm({ item, onGiftUpdate, isUpdating }: GiftFormProps) {
  const [isGift, setIsGift] = useState(item.isGift);
  const [recipientEmail, setRecipientEmail] = useState(
    item.giftRecipientEmail || ""
  );
  const [recipientName, setRecipientName] = useState(
    item.giftRecipientName || ""
  );
  const [giftMessage, setGiftMessage] = useState(item.giftMessage || "");
  const [isOpen, setIsOpen] = useState(item.isGift || item.canOnlyBeGifted);
  const [emailError, setEmailError] = useState("");

  // Track if this is the initial render
  const isInitialMount = useRef(true);
  // Track the last values sent to the API to prevent duplicate calls
  const lastSentValues = useRef({
    isGift: item.isGift,
    recipientEmail: item.giftRecipientEmail || "",
    recipientName: item.giftRecipientName || "",
    giftMessage: item.giftMessage || "",
  });

  // Update state when item prop changes (e.g., after API response)
  useEffect(() => {
    setIsGift(item.isGift);
    setRecipientEmail(item.giftRecipientEmail || "");
    setRecipientName(item.giftRecipientName || "");
    setGiftMessage(item.giftMessage || "");
    setIsOpen(item.isGift || item.canOnlyBeGifted);

    // Update last sent values to match current item state
    lastSentValues.current = {
      isGift: item.isGift,
      recipientEmail: item.giftRecipientEmail || "",
      recipientName: item.giftRecipientName || "",
      giftMessage: item.giftMessage || "",
    };
  }, [
    item.isGift,
    item.giftRecipientEmail,
    item.giftRecipientName,
    item.giftMessage,
    item.canOnlyBeGifted,
  ]);

  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle gift toggle
  const handleGiftToggle = async (checked: boolean) => {
    if (item.canOnlyBeGifted && !checked) {
      // Cannot turn off gift mode for items that can only be gifted
      return;
    }

    setIsGift(checked);

    if (!checked) {
      // If turning off gift mode, clear gift fields and update immediately
      setRecipientEmail("");
      setRecipientName("");
      setGiftMessage("");
      setEmailError("");

      const updateData = {
        isGift: false,
        giftRecipientEmail: undefined,
        giftRecipientName: undefined,
        giftMessage: undefined,
      };

      lastSentValues.current = {
        isGift: false,
        recipientEmail: "",
        recipientName: "",
        giftMessage: "",
      };

      await onGiftUpdate(item.id, updateData);
    } else {
      setIsOpen(true);
    }
  };

  // Handle field updates with debounced API calls
  useEffect(() => {
    // Skip the effect on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!isGift) return;

    const timeoutId = setTimeout(async () => {
      // Check if values have actually changed from last sent values
      const hasChanged =
        isGift !== lastSentValues.current.isGift ||
        recipientEmail !== lastSentValues.current.recipientEmail ||
        recipientName !== lastSentValues.current.recipientName ||
        giftMessage !== lastSentValues.current.giftMessage;

      if (!hasChanged) {
        return; // No changes to send
      }

      // Validate required fields
      if (isGift && !recipientEmail) {
        setEmailError("Recipient email is required for gifts");
        return;
      }

      if (isGift && !validateEmail(recipientEmail)) {
        setEmailError("Please enter a valid email address");
        return;
      }

      setEmailError("");

      // Update last sent values
      lastSentValues.current = {
        isGift,
        recipientEmail,
        recipientName,
        giftMessage,
      };

      // Update gift settings
      await onGiftUpdate(item.id, {
        isGift,
        giftRecipientEmail: recipientEmail || undefined,
        giftRecipientName: recipientName || undefined,
        giftMessage: giftMessage || undefined,
      });
    }, 500); // Debounce API calls by 500ms

    return () => clearTimeout(timeoutId);
  }, [
    isGift,
    recipientEmail,
    recipientName,
    giftMessage,
    item.id,
    onGiftUpdate,
  ]);

  return (
    <div className="space-y-3">
      {/* Auto-gift mode alert */}
      {item.canOnlyBeGifted && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You already own this bundle, so it can only be purchased as a gift.
          </AlertDescription>
        </Alert>
      )}

      {/* Gift toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Gift className="h-4 w-4 text-primary" />
          <Label
            htmlFor={`gift-toggle-${item.id}`}
            className="text-sm font-medium"
          >
            {item.canOnlyBeGifted ? "Gift Purchase" : "Purchase as Gift"}
          </Label>
        </div>
        <Switch
          id={`gift-toggle-${item.id}`}
          checked={isGift}
          onCheckedChange={handleGiftToggle}
          disabled={item.canOnlyBeGifted || isUpdating}
        />
      </div>

      {/* Gift details form - only show when gift mode is enabled */}
      {isGift && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between h-8 text-xs cursor-pointer"
              disabled={!isGift}
            >
              Gift Details
              <Gift className="h-3 w-3" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
          <div className="space-y-2">
            <Label htmlFor={`recipient-email-${item.id}`} className="text-xs">
              Recipient Email *
            </Label>
            <Input
              id={`recipient-email-${item.id}`}
              type="email"
              placeholder="recipient@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              disabled={isUpdating}
              className="h-8 text-xs"
            />
            {emailError && (
              <p className="text-xs text-destructive">{emailError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`recipient-name-${item.id}`} className="text-xs">
              Recipient Name (optional)
            </Label>
            <Input
              id={`recipient-name-${item.id}`}
              placeholder="John Doe"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              disabled={isUpdating}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`gift-message-${item.id}`} className="text-xs">
              Gift Message (optional)
            </Label>
            <Textarea
              id={`gift-message-${item.id}`}
              placeholder="Happy birthday! Enjoy these games..."
              value={giftMessage}
              onChange={(e) => {
                if (e.target.value.length <= GIFT_MESSAGE_LIMIT) {
                  setGiftMessage(e.target.value);
                }
              }}
              disabled={isUpdating}
              className="text-xs min-h-[60px] resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {giftMessage.length}/{GIFT_MESSAGE_LIMIT}
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
      )}
    </div>
  );
}
