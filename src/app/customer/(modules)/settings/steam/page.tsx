"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { useCustomer } from "@/hooks/queries/useCustomer";
import { userApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Info, Unlink, CheckCircle, Gamepad2 } from "lucide-react";
import SteamConnection from "@/app/onboarding/components/steam-connection";
import { SteamUserInfo } from "@/app/onboarding/components/onboarding-form";
import { useQueryClient } from "@tanstack/react-query";
import { customerQueryKey } from "@/hooks/queries/useCustomer";
import { customerLocationQueryKey } from "@/hooks/queries/useCustomerLocation";

export default function SteamAccountSettings() {
  const { data: customer, isLoading } = useCustomer();
  const queryClient = useQueryClient();
  const [steamConnected, setSteamConnected] = useState(false);
  const [steamUserInfo, setSteamUserInfo] = useState<SteamUserInfo | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Initialize state from customer data
  useEffect(() => {
    if (customer) {
      const hasConnection = !!customer.steamId;
      setSteamConnected(hasConnection);
      if (hasConnection) {
        setSteamUserInfo({
          steamId: customer.steamId!,
          steamUsername: customer.steamUsername || undefined,
          steamCountry: customer.steamCountry || undefined,
        });
      }
    }
  }, [customer]);

  const onSteamInfoReceived = async (data: SteamUserInfo) => {
    setSteamUserInfo(data);
    setSteamConnected(true);
    setIsUpdating(true);

    try {
      // Update the customer's Steam details via API
      await userApi.updateSteamDetails(data.steamId, data.steamCountry || null, data.steamUsername || null);
      
      // Invalidate and refetch customer data and location data
      await queryClient.invalidateQueries({ queryKey: customerQueryKey });
      await queryClient.invalidateQueries({ queryKey: customerLocationQueryKey });
      
      toast.success("Steam account connected successfully!", {
        description: "Your Steam account has been linked to your Digiphile profile.",
      });
    } catch (error) {
      console.error("Failed to update Steam details:", error);
      toast.error("Failed to save Steam connection", {
        description: "Please try again or contact support if the issue persists.",
      });
      // Reset state on error
      setSteamConnected(false);
      setSteamUserInfo(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    
    try {
      // Clear Steam details via API
      await userApi.updateSteamDetails(null, null, null);
      
      // Invalidate and refetch customer data and location data
      await queryClient.invalidateQueries({ queryKey: customerQueryKey });
      await queryClient.invalidateQueries({ queryKey: customerLocationQueryKey });
      
      // Reset local state
      setSteamConnected(false);
      setSteamUserInfo(null);
      
      toast.success("Steam account disconnected", {
        description: "Your Steam account has been unlinked from your profile.",
      });
    } catch (error) {
      console.error("Failed to disconnect Steam account:", error);
      toast.error("Failed to disconnect Steam account", {
        description: "Please try again or contact support if the issue persists.",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Steam Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {steamConnected && customer?.steamId ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Steam Account Connected</span>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {customer.steamUsername && (
                      <p>Username: {customer.steamUsername}</p>
                    )}
                    <p>Steam ID: {customer.steamId}</p>
                    {customer.steamCountry && (
                      <p>Region: {customer.steamCountry}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                >
                  {isDisconnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <Unlink className="mr-2 h-4 w-4" />
                      Disconnect
                    </>
                  )}
                </Button>
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Your Steam account is connected. You can purchase Steam game bundles and receive region-appropriate keys.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Connect your Steam account to purchase Steam game bundles. This ensures you receive region-appropriate keys for your account.
                </AlertDescription>
              </Alert>
              
              {/* Reuse the SteamConnection component from onboarding */}
              <SteamConnection
                steamConnected={steamConnected}
                steamUserInfo={steamUserInfo}
                onSteamInfoReceived={onSteamInfoReceived}
              />
              
              {isUpdating && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Steam connection...</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}