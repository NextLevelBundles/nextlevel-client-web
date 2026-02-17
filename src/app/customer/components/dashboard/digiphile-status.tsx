"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { User } from "lucide-react";
import Link from "next/link";
import { useCustomer } from "@/hooks/queries/useCustomer";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function DigiphileStatus() {
  const { data: customer, isLoading } = useCustomer();

  if (isLoading) {
    return (
      <Card className="bg-linear-to-br from-card to-card/95 shadow-md">
        <CardHeader>
          <CardTitle>Digiphile Account</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground animate-pulse">
            Loading account info...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!customer?.handle) {
    return (
      <Card className="bg-linear-to-br from-card to-card/95 shadow-md">
        <CardHeader>
          <CardTitle>Digiphile Account</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            No Digiphile handle set
          </div>
        </CardContent>
      </Card>
    );
  }

  const joinedDate = customer.createdAt 
    ? dayjs(customer.createdAt).fromNow()
    : null;

  return (
    <Card className="bg-linear-to-br from-card to-card/95 shadow-md">
      <CardHeader>
        <CardTitle>Digiphile Account</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="relative"
          >
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-primary/20">
              <User className="h-6 w-6 text-primary" />
            </div>
          </motion.div>
          <div>
            <div className="font-medium">
              @{customer.handle}
            </div>
            <div className="text-sm text-muted-foreground">
              Member {joinedDate}
            </div>
          </div>
        </div>
        <Link href={`/community/profiles/${customer.handle}`}>
          <Button
            variant="outline"
            className="relative overflow-hidden group"
          >
            <span className="relative z-10">View Profile</span>
            <motion.div
              className="absolute inset-0 bg-primary/5"
              initial={{ scale: 0 }}
              whileHover={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}