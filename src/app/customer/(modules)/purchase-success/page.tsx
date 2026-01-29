"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Home,
  ShoppingBag,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  Copy,
  Check,
} from "lucide-react";
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
    "I just purchased an amazing bundle from NextLevel Bundle! Check it out and support charity while getting great games! 🎮✨";

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
      name: "Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      color: "bg-[#1DA1F2] hover:bg-[#1a8cd8]",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: "bg-[#1877F2] hover:bg-[#1665d8]",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: "bg-[#0A66C2] hover:bg-[#095196]",
    },
    {
      name: "Email",
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent("Check out NextLevel Bundle!")}&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`,
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
        <Card className="border-2 border-green-200 dark:border-green-800 shadow-2xl">
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
                Thank you for your purchase! Your order has been confirmed.
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
                  Help others discover great bundles while supporting charity.
                  Share NextLevel Bundle with your friends!
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
                        <social.icon className="h-4 w-4 mr-2" />
                        {social.name}
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
                A confirmation email has been sent to your registered email
                address.
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
