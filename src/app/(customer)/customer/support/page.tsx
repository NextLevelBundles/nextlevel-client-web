"use client";

import React from "react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/customer/components/ui/card";
import { Button } from "@/customer/components/ui/button";
import { Input } from "@/customer/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/customer/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/customer/components/ui/accordion";
import { motion } from "framer-motion";
import {
  HeadphonesIcon,
  KeyIcon,
  CreditCardIcon,
  ShieldIcon,
} from "lucide-react";

const faqCategories = [
  {
    title: "Game Keys",
    icon: <KeyIcon className="h-5 w-5 text-primary" />,
    faqs: [
      {
        question: "How do I reveal my game keys?",
        answer:
          "Navigate to 'My Keys' and click the 'Reveal Key' button next to any unrevealed game. The key will be displayed and can be copied or activated directly on Steam.",
        learnMore: "/help/game-keys",
      },
      {
        question: "What if my key doesn't work?",
        answer:
          "First, verify you're entering the key correctly. If issues persist, contact our support team for immediate assistance with key activation.",
        learnMore: "/help/key-issues",
      },
    ],
  },
  {
    title: "Payment & Refunds",
    icon: <CreditCardIcon className="h-5 w-5 text-primary" />,
    faqs: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards, PayPal, and various regional payment methods. All transactions are secure and encrypted.",
        learnMore: "/help/payment-methods",
      },
      {
        question: "How do refunds work?",
        answer:
          "Refund requests can be submitted within 14 days of purchase if no keys have been revealed. Each case is reviewed individually.",
        learnMore: "/help/refunds",
      },
    ],
  },
  {
    title: "Account & Security",
    icon: <ShieldIcon className="h-5 w-5 text-primary" />,
    faqs: [
      {
        question: "How do I secure my account?",
        answer:
          "Enable two-factor authentication, use a strong password, and never share your login credentials. Regular security audits are recommended.",
        learnMore: "/help/security",
      },
      {
        question: "Lost access to your account?",
        answer:
          "Use the password reset feature or contact support with your registered email for account recovery assistance.",
        learnMore: "/help/account-recovery",
      },
    ],
  },
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFaq, setSelectedFaq] = useState<{
    question: string;
    answer: string;
    learnMore: string;
  } | null>(null);

  const launchChat = () => {
    // if (window.Intercom) {
    //   window.Intercom('show');
    //   toast.success('Chat launched! Our team will be with you shortly.');
    // }
  };

  const filteredCategories = faqCategories
    .map((category) => ({
      ...category,
      faqs: category.faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.faqs.length > 0);

  return (
    <div className="grid gap-6 relative max-w-(--breakpoint-lg) mx-auto px-4 sm:px-6 md:px-8">
      {/* Floating Chat Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          size="lg"
          className="rounded-full h-14 w-14 bg-primary shadow-lg hover:shadow-xl"
          onClick={launchChat}
          aria-label="Open support chat"
          title="Chat with support"
        >
          <HeadphonesIcon className="h-6 w-6" />
        </Button>
      </motion.div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Need Help? 🤝</h1>
        <p className="text-muted-foreground">
          Browse our FAQ or chat with our support team for assistance.
        </p>
      </div>

      <div className="relative">
        <Input
          placeholder="Search FAQs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid gap-6">
        {filteredCategories.map((category, categoryIndex) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
          >
            <Card className="overflow-hidden bg-linear-to-br from-card/50 to-card hover:shadow-md transition-all duration-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-2">
                    {category.icon}
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion
                  type="single"
                  collapsible
                  className="w-full divide-y divide-muted/20"
                >
                  {category.faqs.map((faq, faqIndex) => (
                    <AccordionItem
                      key={faqIndex}
                      value={`${categoryIndex}-${faqIndex}`}
                    >
                      <AccordionTrigger className="text-left py-4 hover:bg-muted/10 rounded-md px-3 -mx-3 transition-all duration-200 ease-in-out">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="py-3">
                        <div className="space-y-4">
                          <p className="text-muted-foreground">{faq.answer}</p>
                          <Button
                            variant="link"
                            className="p-0 h-auto font-medium"
                            onClick={() => setSelectedFaq(faq)}
                          >
                            Learn more
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={!!selectedFaq} onOpenChange={() => setSelectedFaq(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedFaq?.question}</DialogTitle>
            <DialogDescription className="pt-4">
              {selectedFaq?.answer}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSelectedFaq(null)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
