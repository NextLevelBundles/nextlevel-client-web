"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Home,
  ShoppingBag,
  Share2,
  Facebook,
  Mail,
  Copy,
  Check,
  MessageCircle,
} from "lucide-react";

// Custom X (formerly Twitter) icon
const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={className}
    fill="currentColor"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Bluesky icon
const BlueskyIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={className}
    fill="currentColor"
  >
    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.04.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.015.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
  </svg>
);
import { Button } from "@/app/(shared)/components/ui/button";
import { Card, CardContent } from "@/app/(shared)/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

export default function PurchaseSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  // Get order details from URL params (optional)
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  useEffect(() => {
    // Confetti effect on mount
    if (typeof window !== "undefined") {
      // You can add a confetti library here if desired
    }
  }, []);

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}`;
  const shareText =
    "I just purchased an amazing collection from Digiphile! Check it out and support charity while getting great games!";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied!", {
        description: "Share it with your friends!",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const socialShareButtons = [
    {
      name: "X",
      icon: XIcon,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      color:
        "bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: "bg-[#1877F2] hover:bg-[#1665d8]",
    },
    {
      name: "Bluesky",
      icon: BlueskyIcon,
      href: `https://bsky.app/intent/compose?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
      color: "bg-[#0085ff] hover:bg-[#0070d9]",
    },
    {
      name: "Email",
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent("Check out Digiphile!")}&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`,
      color: "bg-gray-600 hover:bg-gray-700",
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-gray-950 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl my-8"
      >
        <Card className="shadow-2xl">
          <CardContent className="pt-12 pb-8 px-6">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-6">
                <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
              </div>
            </motion.div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center space-y-4 mb-8"
            >
              <h1 className="text-3xl font-bold text-foreground">
                Purchase Successful!
              </h1>
              <p className="text-lg text-muted-foreground">
                Thank you for your purchase! Your payment has been confirmed.
              </p>
              {orderId && (
                <p className="text-sm text-muted-foreground">
                  Order ID:{" "}
                  <span className="font-mono font-medium">{orderId}</span>
                </p>
              )}
            </motion.div>

            {/* Social Sharing Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <div className="rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/20 p-6 space-y-4">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Share2 className="h-5 w-5" />
                  <h2 className="text-xl font-semibold">Spread the Word!</h2>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Help others discover great collections while supporting
                  charity. Share Digiphile with your friends!
                </p>

                {/* Social Media Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  {socialShareButtons.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button
                        variant="outline"
                        className={`w-full ${social.color} text-white border-0 hover:text-white`}
                      >
                        <social.icon
                          className={
                            social.name === "X" ? "h-4 w-4" : "h-4 w-4 mr-2"
                          }
                        />
                        {social.name !== "X" && social.name}
                      </Button>
                    </a>
                  ))}
                </div>

                {/* Copy Link Button */}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Link Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>

                {/* Reddit Section */}
                <div className="pt-4 border-t border-primary/20">
                  <a
                    href="https://www.reddit.com/r/digiphile/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      variant="outline"
                      className="w-full bg-[#FF4500] hover:bg-[#ff5722] text-white border-0 hover:text-white"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Join the conversation now!
                    </Button>
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Navigation CTAs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link href="/customer/purchases" className="flex-1">
                <Button variant="default" className="w-full gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  View Purchase History
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <Home className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6 text-center"
            >
              <p className="text-xs text-muted-foreground">
                A purchase confirmation email has been sent to your registered
                email address.
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
