"use client";

import { useState, useEffect, useRef } from "react";
import { Gift, AlertCircle, Mail, Link2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/(shared)/components/ui/button";
import { Input } from "@/app/(shared)/components/ui/input";
import { Label } from "@/app/(shared)/components/ui/label";
import { Textarea } from "@/app/(shared)/components/ui/textarea";
import { Switch } from "@/app/(shared)/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/app/(shared)/components/ui/radio-group";
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
  // Default to "link" if no email is set, otherwise "email"
  const [deliveryMethod, setDeliveryMethod] = useState<"email" | "link">(
    item.giftRecipientEmail ? "email" : "link"
  );

  // Track if this is the initial render
  const isInitialMount = useRef(true);
  // Track the last values sent to the API to prevent duplicate calls
  const lastSentValues = useRef({
    isGift: item.isGift,
    recipientEmail: item.giftRecipientEmail || "",
    recipientName: item.giftRecipientName || "",
    giftMessage: item.giftMessage || "",
  });
  // Track the item ID to detect when we're switching to a different item
  const lastItemId = useRef(item.id);
  // Track active timeout to cancel it if needed
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update state when switching to a different cart item
  useEffect(() => {
    if (lastItemId.current !== item.id) {
      // Clear any pending timeout when switching items
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }

      // Reset state for the new item
      setIsGift(item.isGift);
      setRecipientEmail(item.giftRecipientEmail || "");
      setRecipientName(item.giftRecipientName || "");
      setGiftMessage(item.giftMessage || "");
      setIsOpen(item.isGift || item.canOnlyBeGifted);
      setEmailError("");
      setDeliveryMethod(item.giftRecipientEmail ? "email" : "link");

      // Update tracking refs
      lastItemId.current = item.id;
      lastSentValues.current = {
        isGift: item.isGift,
        recipientEmail: item.giftRecipientEmail || "",
        recipientName: item.giftRecipientName || "",
        giftMessage: item.giftMessage || "",
      };
      isInitialMount.current = true;
    }
  }, [item.id, item.isGift, item.giftRecipientEmail, item.giftRecipientName, item.giftMessage, item.canOnlyBeGifted]);

  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle delivery method change
  const handleDeliveryMethodChange = async (method: "email" | "link") => {
    setDeliveryMethod(method);

    if (method === "link") {
      // Clear email fields when switching to link
      setRecipientEmail("");
      setRecipientName("");
      setGiftMessage("");
      setEmailError("");

      // Update immediately
      lastSentValues.current = {
        isGift: true,
        recipientEmail: "",
        recipientName: "",
        giftMessage: "",
      };

      await onGiftUpdate(item.id, {
        isGift: true,
        giftRecipientEmail: undefined,
        giftRecipientName: undefined,
        giftMessage: undefined,
      });
    }
  };

  // Handle gift toggle
  const handleGiftToggle = async (checked: boolean) => {
    if (item.canOnlyBeGifted && !checked) {
      // Cannot turn off gift mode for items that can only be gifted
      return;
    }

    // Clear any pending timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
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

    // Skip if delivery method is link (no validation needed)
    if (deliveryMethod === "link") return;

    // Clear any existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Set new timeout
    updateTimeoutRef.current = setTimeout(async () => {
      // Check if values have actually changed from last sent values
      const hasChanged =
        isGift !== lastSentValues.current.isGift ||
        recipientEmail !== lastSentValues.current.recipientEmail ||
        recipientName !== lastSentValues.current.recipientName ||
        giftMessage !== lastSentValues.current.giftMessage;

      if (!hasChanged) {
        return; // No changes to send
      }

      // Validate required fields only for email delivery
      if (deliveryMethod === "email" && !recipientEmail) {
        setEmailError("Recipient email is required for gifts");
        return;
      }

      if (deliveryMethod === "email" && !validateEmail(recipientEmail)) {
        setEmailError("Please enter a valid email address");
        return;
      }

      setEmailError("");

      // Update last sent values BEFORE making the API call
      lastSentValues.current = {
        isGift,
        recipientEmail,
        recipientName,
        giftMessage,
      };

      // Update gift settings
      try {
        await onGiftUpdate(item.id, {
          isGift,
          giftRecipientEmail: recipientEmail || undefined,
          giftRecipientName: recipientName || undefined,
          giftMessage: giftMessage || undefined,
        });
      } catch (error) {
        // On error, revert last sent values so user can retry
        console.error("Failed to update gift settings:", error);
      }
    }, 500); // Debounce API calls by 500ms

    return () => {
      // Cleanup is handled by the next effect run
    };
  }, [
    isGift,
    recipientEmail,
    recipientName,
    giftMessage,
    item.id,
    onGiftUpdate,
    deliveryMethod,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

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
            {/* Delivery method selection */}
            <div className="space-y-2">
              <Label className="text-xs">Delivery Method</Label>
              <RadioGroup
                value={deliveryMethod}
                onValueChange={(value) => handleDeliveryMethodChange(value as "email" | "link")}
                disabled={isUpdating}
                className="gap-2"
              >
                <div
                  className="flex items-center space-x-2 p-2 rounded-md border hover:bg-accent/50 cursor-pointer"
                  onClick={() => !isUpdating && handleDeliveryMethodChange("email")}
                >
                  <RadioGroupItem value="email" id={`email-${item.id}`} />
                  <span className="text-xs font-normal flex-1 flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    Send via Email
                  </span>
                </div>
                <div
                  className="flex items-center space-x-2 p-2 rounded-md border hover:bg-accent/50 cursor-pointer"
                  onClick={() => !isUpdating && handleDeliveryMethodChange("link")}
                >
                  <RadioGroupItem value="link" id={`link-${item.id}`} />
                  <span className="text-xs font-normal flex-1 flex items-center gap-2">
                    <Link2 className="h-3.5 w-3.5" />
                    Get Direct Link
                  </span>
                </div>
              </RadioGroup>
            </div>

            {/* Email fields - only show when email delivery is selected */}
            {deliveryMethod === "email" && (
              <>
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
              </>
            )}

            {/* Link info - show when link delivery is selected */}
            {deliveryMethod === "link" && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  After purchase, find the gift link in{" "}
                  <Link
                    href="/customer/purchases"
                    className="underline hover:text-primary font-medium"
                  >
                    Dashboard → Purchase History
                  </Link>
                  {" "}→ Click on the Gift label.
                </AlertDescription>
              </Alert>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
