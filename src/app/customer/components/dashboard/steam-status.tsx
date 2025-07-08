"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { DamIcon as SteamIcon } from "lucide-react";

export function SteamStatus() {
  const isConnected = true; // This would come from your auth state
  const steamUser = {
    name: "GamerTag123",
    avatar:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&auto=format&fit=crop",
  };

  if (!isConnected) {
    return (
      <Card className="bg-linear-to-br from-card to-card/95 shadow-md">
        <CardHeader>
          <CardTitle>Steam Account</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Connect your Steam account to activate keys directly
          </div>
          <Button className="relative overflow-hidden">
            <SteamIcon className="mr-2 h-4 w-4" />
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
          >
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage src={steamUser.avatar} alt={steamUser.name} />
              <AvatarFallback>ST</AvatarFallback>
            </Avatar>
          </motion.div>
          <div>
            <div className="font-medium">{steamUser.name}</div>
            <div className="text-sm text-muted-foreground">
              Connected to Steam
            </div>
          </div>
        </div>
        <Button variant="outline" className="relative overflow-hidden group">
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
