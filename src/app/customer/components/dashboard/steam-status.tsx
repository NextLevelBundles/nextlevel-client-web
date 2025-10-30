"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Gamepad2 } from "lucide-react";
import { useCustomer } from "@/hooks/queries/useCustomer";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function SteamStatus() {
  const { data: customer, isLoading } = useCustomer();
  const router = useRouter();

  if (isLoading) {
    return (
      <Card className="bg-linear-to-br from-card to-card/95 shadow-md">
        <CardHeader>
          <CardTitle>Steam Account</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground animate-pulse">
            Loading Steam status...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!customer?.steamId) {
    return (
      <Card className="bg-linear-to-br from-card to-card/95 shadow-md">
        <CardHeader>
          <CardTitle>Steam Account</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-6">
          <div className="text-sm text-muted-foreground">
            Connect your Steam account to be able to purchase Steam Bundles
          </div>
          <Button
            className="relative overflow-hidden"
            onClick={() => router.push("/customer/settings/steam")}
          >
            <Gamepad2 className="mr-2 h-4 w-4" />
            Connect Steam
            <motion.div
              className="absolute inset-0 bg-white/10"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.5 }}
            />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const connectedDate = customer.steamConnectedAt
    ? dayjs(customer.steamConnectedAt).fromNow()
    : null;

  return (
    <Card className="bg-linear-to-br from-card to-card/95 shadow-md">
      <CardHeader>
        <CardTitle>Steam Account</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="relative"
          >
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#171A21] to-[#1B2838] flex items-center justify-center ring-2 ring-primary/20">
              <Gamepad2 className="h-6 w-6 text-white" />
            </div>
          </motion.div>
          <div>
            <div className="font-medium">Steam ID: {customer.steamId}</div>
            <div className="text-sm text-muted-foreground">
              Connected {connectedDate}
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          className="relative overflow-hidden group"
          onClick={() =>
            window.open(
              `https://steamcommunity.com/profiles/${customer.steamId}`,
              "_blank"
            )
          }
        >
          <span className="relative z-10">View Profile</span>
          <motion.div
            className="absolute inset-0 bg-primary/5"
            initial={{ scale: 0 }}
            whileHover={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          />
        </Button>
      </CardContent>
    </Card>
  );
}
