'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, KeyIcon, GiftIcon, DamIcon as SteamIcon, ExternalLinkIcon, HeartIcon, TrophyIcon, ReceiptIcon, CopyIcon, PackageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type BundleDetailsProps = {
  bundleDetails: any; // Replace with proper type
}

function PurchaseSummaryItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export function BundleDetails({ bundleDetails }: BundleDetailsProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <motion.div
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.98 }}
          className="inline-block"
        >
          <Button 
            variant="ghost" 
            className="mb-4 gap-2 pl-0 text-muted-foreground hover:text-foreground transition-colors group"
            onClick={() => router.push('/purchases')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="group-hover:underline">Back to Purchase History</span>
          </Button>
        </motion.div>
        <div className="flex flex-col gap-4 rounded-lg border bg-card/30 p-6">
          <div>
            <h1 className="text-3xl font-bold">🎁 {bundleDetails.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Purchased on {new Date(bundleDetails.purchaseDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 dark:bg-[#1a1d24] px-4 py-2">
              <PackageIcon className="h-5 w-5 text-primary" />
              <span>{bundleDetails.itemCount} Games</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-accent/10 dark:bg-[#1a1d24] px-4 py-2">
              <HeartIcon className="h-5 w-5 text-accent" />
              <span>${bundleDetails.charity.amount.toFixed(2)} Donated</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 pb-4">
              <SteamIcon className="h-5 w-5 text-primary" />
              Games in Bundle
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {bundleDetails.games.map((game) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-6 first:pt-0 last:pb-0"
              >
                <div className="flex flex-col gap-4 group rounded-xl transition-all duration-200 hover:bg-muted/5 dark:hover:bg-[#1d2233]/60">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted/50 dark:bg-[#1e2229]">
                      <img
                        src={`https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&auto=format&fit=crop`}
                        alt={game.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{game.name}</h3>
                      <Badge variant="outline" className="gap-1">
                        <SteamIcon className="h-3 w-3" />
                        Steam
                      </Badge>
                      <Badge variant="outline">{game.region}</Badge>
                    </div>
                    {game.revealed ? (
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-muted/50 dark:bg-muted/20 px-2 py-1 font-mono">
                        {game.key}
                      </code>
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <CopyIcon className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy to clipboard</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <ExternalLinkIcon className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Activate on Steam</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <GiftIcon className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Gift this game</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    ) : (
                    <div className="flex items-center gap-4">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          className="gap-2 bg-linear-to-r from-primary to-primary/90"
                          onClick={() => handleRevealKey(game.id)}
                        >
                          <KeyIcon className="h-4 w-4" />
                          Reveal Key
                        </Button>
                      </motion.div>
                    </div>
                    )}
                  </div>

                  <div className="rounded-lg bg-muted/30 dark:bg-muted/10 p-4 text-sm">
                    <h4 className="mb-2 font-medium">System Requirements</h4>
                    <ul className="grid gap-1 text-muted-foreground sm:grid-cols-2">
                      <li>OS: {game.systemRequirements.minimum.os}</li>
                      <li>Processor: {game.systemRequirements.minimum.processor}</li>
                      <li>Memory: {game.systemRequirements.minimum.memory}</li>
                      <li>Graphics: {game.systemRequirements.minimum.graphics}</li>
                      <li>Storage: {game.systemRequirements.minimum.storage}</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ReceiptIcon className="h-5 w-5 text-primary" />
                Purchase Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PurchaseSummaryItem 
                label="Purchase Date" 
                value={new Date(bundleDetails.purchaseDate).toLocaleDateString()} 
              />
              <PurchaseSummaryItem 
                label="Amount Paid" 
                value={`$${bundleDetails.amount.toFixed(2)}`} 
              />
              <PurchaseSummaryItem 
                label="Bundle Tier" 
                value={`${bundleDetails.tier} (${bundleDetails.itemCount} Items)`} 
              />
              <PurchaseSummaryItem 
                label="Transaction ID" 
                value={`#${bundleDetails.transactionId}`} 
              />
              <PurchaseSummaryItem 
                label="Payment Method" 
                value={bundleDetails.paymentMethod} 
              />
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-accent/10 to-accent/5 dark:from-accent/20 dark:to-accent/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeartIcon className="h-5 w-5 text-primary" />
                Charity Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-background/50 dark:bg-background/20 p-4">
                <p className="mb-2 font-medium text-accent">
                  {bundleDetails.charity.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Your purchase contributed ${bundleDetails.charity.amount.toFixed(2)} to support
                  gamers with disabilities.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="gap-2">
                        <TrophyIcon className="h-3 w-3" />
                        {bundleDetails.charity.badge}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      Unlocked for contributing extra to a cause
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="text-sm text-muted-foreground">Badge Earned</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/my-keys">
                <Button className="w-full bg-linear-to-r from-primary to-primary/90">
                  Go to My Keys
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/bundles">
                <Button variant="outline" className="w-full">
                  Browse More Bundles
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}