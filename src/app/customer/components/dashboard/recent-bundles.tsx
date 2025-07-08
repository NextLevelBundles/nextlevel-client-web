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
  KeyIcon,
  ChevronRightIcon,
  DamIcon as SteamIcon,
  PackageIcon,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import Link from "next/link";

const recentBundles: {
  id: number;
  name: string;
  purchaseDate: string;
  unclaimedKeys: number;
}[] = [
  {
    id: 1,
    name: "Indie Gems Bundle",
    purchaseDate: "2024-03-20",
    unclaimedKeys: 3,
  },
  {
    id: 2,
    name: "Strategy Masters Collection",
    purchaseDate: "2024-03-15",
    unclaimedKeys: 1,
  },
  {
    id: 3,
    name: "RPG Essentials Pack",
    purchaseDate: "2024-03-10",
    unclaimedKeys: 2,
  },
];

export function RecentBundles() {
  return (
    <Card className="bg-linear-to-br from-card to-card/95 shadow-md">
      <CardHeader>
        <CardTitle>Recent Purchases</CardTitle>
      </CardHeader>
      {recentBundles.length === 0 ? (
        <CardContent>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-lg border bg-card/30 p-8 text-center"
          >
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <PackageIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">No purchases yet</h3>
            <p className="mb-6 max-w-md text-muted-foreground">
              Start your gaming journey by exploring our curated bundles. Every
              purchase supports amazing causes!
            </p>
            <Link href="/bundles">
              <Button className="bg-linear-to-r from-primary to-primary/90">
                Browse Bundles
              </Button>
            </Link>
          </motion.div>
        </CardContent>
      ) : (
        <CardContent className="max-h-[400px] overflow-y-auto">
          <div className="space-y-4">
            {recentBundles.map((bundle, index) => (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="group flex items-center justify-between rounded-lg border p-4 transition-all duration-200 hover:bg-muted/5 dark:hover:bg-[#1d2233]/60 dark:hover:shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{bundle.name}</p>
                    <Badge variant="outline" className="gap-1">
                      <SteamIcon className="h-3 w-3" />
                      Steam
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Purchased on{" "}
                    {new Date(bundle.purchaseDate).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="group-hover:bg-primary/5 dark:ring-1 dark:ring-blue-400/30 dark:hover:ring-blue-500/60"
                >
                  <KeyIcon className="mr-2 h-4 w-4" />
                  {bundle.unclaimedKeys} keys to claim
                  <ChevronRightIcon className="ml-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
