'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeyIcon, GiftIcon, HelpCircleIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function QuickActions() {
  return (
    <Card className="bg-linear-to-br from-card to-card/95 shadow-md">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 sm:flex-row sm:gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button className="w-full bg-linear-to-r from-primary to-primary/90">
                  <KeyIcon className="mr-2 h-4 w-4" />
                  Reveal Keys
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reveal your unclaimed game keys</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="secondary" className="w-full bg-linear-to-r from-secondary to-secondary/90">
                  <GiftIcon className="mr-2 h-4 w-4" />
                  Claim Gift
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Redeem a gift from another user</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" className="w-full">
                  <HelpCircleIcon className="mr-2 h-4 w-4" />
                  Go to Support
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Get help with your purchases</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}