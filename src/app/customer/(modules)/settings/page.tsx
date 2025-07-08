"use client";

import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { SettingsIcon, BellIcon, ShieldIcon } from "lucide-react";

// Import settings pages
import SecurityPage from "./security/page";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Card className="p-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start gap-4 rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="general"
              className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <div className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                General
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <div className="flex items-center gap-2">
                <BellIcon className="h-4 w-4" />
                Notifications
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <div className="flex items-center gap-2">
                <ShieldIcon className="h-4 w-4" />
                Security & Support
              </div>
            </TabsTrigger>
          </TabsList>
          <div className="p-4">
            <TabsContent value="general" className="mt-0">
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border bg-card/30 p-8 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <SettingsIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">General Settings</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  General settings will be available here soon.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="notifications" className="mt-0">
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border bg-card/30 p-8 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <BellIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  Notification Settings
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Notification preferences will be available here soon.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="security" className="mt-0">
              <SecurityPage />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
