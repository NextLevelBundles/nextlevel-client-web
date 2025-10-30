"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Card } from "@/shared/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  SettingsIcon,
  BellIcon,
  ShieldIcon,
  CreditCardIcon,
  Gamepad2,
} from "lucide-react";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getCurrentTab = () => {
    if (pathname.includes("/notifications")) return "notifications";
    if (pathname.includes("/security")) return "security";
    if (pathname.includes("/billing")) return "billing";
    if (pathname.includes("/steam")) return "steam";
    return "general";
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Card className="p-1">
        <Tabs value={getCurrentTab()} className="w-full">
          <TabsList className="w-full justify-start gap-4 rounded-none border-b bg-transparent p-0">
            <Link href="/customer/settings" className="flex">
              <TabsTrigger
                value="general"
                className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                <div className="flex items-center gap-2">
                  <SettingsIcon className="h-4 w-4" />
                  General
                </div>
              </TabsTrigger>
            </Link>
            {/* <Link href="/customer/settings/billing" className="flex">
              <TabsTrigger
                value="billing"
                className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                <div className="flex items-center gap-2">
                  <CreditCardIcon className="h-4 w-4" />
                  Billing Address
                </div>
              </TabsTrigger>
            </Link>
            <Link href="/customer/settings/notifications" className="flex">
              <TabsTrigger
                value="notifications"
                className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                <div className="flex items-center gap-2">
                  <BellIcon className="h-4 w-4" />
                  Notifications
                </div>
              </TabsTrigger>
            </Link>
            <Link href="/customer/settings/security" className="flex">
              <TabsTrigger
                value="security"
                className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                <div className="flex items-center gap-2">
                  <ShieldIcon className="h-4 w-4" />
                  Security & Support
                </div>
              </TabsTrigger>
            </Link> */}
            <Link href="/customer/settings/steam" className="flex">
              <TabsTrigger
                value="steam"
                className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                <div className="flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4" />
                  Steam Account
                </div>
              </TabsTrigger>
            </Link>
          </TabsList>
          <div className="p-4">{children}</div>
        </Tabs>
      </Card>
    </div>
  );
}
