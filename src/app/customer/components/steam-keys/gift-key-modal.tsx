"use client";

import { useState } from "react";
import { Gift, Send, User, Mail, MessageSquare, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/(shared)/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/(shared)/components/ui/form";
import { Input } from "@/app/(shared)/components/ui/input";
import { Textarea } from "@/app/(shared)/components/ui/textarea";
import { Button } from "@/app/(shared)/components/ui/button";
import { Alert, AlertDescription } from "@/app/(shared)/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SteamKeyAssignment, GiftKeyRequest } from "@/lib/api/types/steam-key";

const GIFT_MESSAGE_LIMIT = 500;

const giftFormSchema = z.object({
  recipientEmail: z
    .string()
    .min(1, "Recipient email is required")
    .email("Please enter a valid email address"),
  recipientName: z.string().optional(),
  message: z
    .string()
    .max(GIFT_MESSAGE_LIMIT, `Message must be ${GIFT_MESSAGE_LIMIT} characters or less`)
    .optional(),
});

type GiftFormValues = z.infer<typeof giftFormSchema>;

interface GiftKeyModalProps {
  steamKey: SteamKeyAssignment;
  isOpen: boolean;
  onClose: () => void;
  onGift: (assignmentId: string, giftData: GiftKeyRequest) => Promise<void>;
}

export function GiftKeyModal({
  steamKey,
  isOpen,
  onClose,
  onGift,
}: GiftKeyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const form = useForm<GiftFormValues>({
    resolver: zodResolver(giftFormSchema),
    defaultValues: {
      recipientEmail: "",
      recipientName: "",
      message: "",
    },
  });

  const handleSubmit = async (values: GiftFormValues) => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await onGift(steamKey.id, {
        recipientEmail: values.recipientEmail,
        recipientName: values.recipientName,
        message: values.message,
      });
      form.reset();
      setShowConfirmation(false);
      onClose();
    } catch (error) {
      console.error("Failed to gift key:", error);
      setShowConfirmation(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setShowConfirmation(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Gift Steam Key
          </DialogTitle>
          <DialogDescription>
            Send this game as a gift to someone special
          </DialogDescription>
        </DialogHeader>

        <div className="my-4">
          {/* Game Preview */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{steamKey.productTitle}</h4>
              <p className="text-xs text-muted-foreground">
                Steam Key
              </p>
            </div>
          </div>
        </div>

        {!showConfirmation ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="recipientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Recipient Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="friend@example.com"
                        type="email"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      We&apos;ll send the gift to this email address
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recipientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Recipient Name (optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Personalize the gift with their name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Personal Message (optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Happy birthday! Enjoy this game..."
                        className="resize-none"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/{GIFT_MESSAGE_LIMIT} characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Continue
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <Alert>
              <Gift className="h-4 w-4" />
              <AlertDescription>
                <strong>Please confirm:</strong> Once you send this gift, the
                Steam key will be transferred to the recipient and you will no
                longer have access to it.
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Recipient:</span>{" "}
                {form.getValues("recipientEmail")}
                {form.getValues("recipientName") && (
                  <> ({form.getValues("recipientName")})</>
                )}
              </div>
              <div>
                <span className="font-medium">Game:</span> {steamKey.productTitle}
              </div>
              {form.getValues("message") && (
                <div>
                  <span className="font-medium">Message:</span>
                  <p className="mt-1 p-2 bg-muted rounded text-xs">
                    {form.getValues("message")}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                onClick={form.handleSubmit(handleSubmit)}
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending Gift...
                  </>
                ) : (
                  <>
                    <Gift className="h-4 w-4" />
                    Send Gift
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}