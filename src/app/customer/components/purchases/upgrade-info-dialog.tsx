"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/(shared)/components/ui/dialog";
import { Button } from "@/app/(shared)/components/ui/button";
import { Card, CardContent } from "@/app/(shared)/components/ui/card";
import { Info, ArrowUp, Gift, Check } from "lucide-react";

interface UpgradeInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeInfoDialog({ isOpen, onClose }: UpgradeInfoDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            About Collection Upgrades
          </DialogTitle>
          <DialogDescription>
            Learn how upgrading your collections works
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <ArrowUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">
                    What is an Upgrade?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The upgrade feature allows you to unlock higher tiers of a
                    collection you've already purchased. You can upgrade to a
                    better base tier, add charity tiers, or unlock bonus
                    content—all without repurchasing the entire collection.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">How It Works</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Select a higher tier to unlock more items</li>
                    <li>
                      • Optionally add charity or bonus tiers for extra content
                    </li>
                    <li>
                      • Pay only the difference between your current tier and
                      the new one
                    </li>
                    <li>
                      • Your card on file is automatically charged upon
                      confirmation
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Gift className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm mb-1 text-orange-700 dark:text-orange-300">
                    Not Available for Gifted Collections
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    This collection was a gift, so the upgrade feature is not
                    available. Upgrades are only supported for collections you
                    purchased directly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
