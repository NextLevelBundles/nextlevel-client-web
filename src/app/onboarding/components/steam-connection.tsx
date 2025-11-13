"use client";

import { Label } from "@/app/(shared)/components/ui/label";
import { Gamepad2, Loader2, MapPin, AlertTriangle } from "lucide-react";
import { SteamUserInfo } from "./onboarding-form";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Alert, AlertDescription } from "@/app/(shared)/components/ui/alert";
import { useCountries } from "@/hooks/queries/useCountries";
import { Country } from "@/lib/api/clients/common";

interface SteamProfile {
  steamid: string;
  communityvisibilitystate: number;
  profilestate: number;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  avatarhash: string;
  lastlogoff: number;
  personastate: number;
  realname?: string;
  primaryclanid?: string;
  timecreated?: number;
  personastateflags?: number;
  loccountrycode?: string;
  locstatecode?: string;
  loccityid?: number;
}

interface SteamConnectionProps {
  steamConnected: boolean;
  steamUserInfo?: SteamUserInfo | null;
  onSteamInfoReceived: (data: SteamUserInfo) => void;
}
export default function SteamConnection({
  steamConnected,
  steamUserInfo,
  onSteamInfoReceived,
}: SteamConnectionProps) {
  const [steamProfile, setSteamProfile] = useState<SteamProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [userCountry, setUserCountry] = useState<Country | null>(null);

  // Use TanStack Query to fetch countries
  const { data: countries = [], isLoading: isLoadingCountries } =
    useCountries();

  // Update user country when we have both countries list and steam profile
  useEffect(() => {
    if (countries.length > 0 && steamProfile?.loccountrycode) {
      const country = countries.find(
        (c) => c.id === steamProfile.loccountrycode
      );
      if (country) {
        setUserCountry(country);
      }
    }
  }, [countries, steamProfile?.loccountrycode]);

  // Load Steam profile when we have a Steam ID
  useEffect(() => {
    const loadSteamProfile = async (steamId: string) => {
      setIsLoadingProfile(true);
      try {
        const response = await fetch(`/api/steam/profile?steamid=${steamId}`);
        if (response.ok) {
          const profile = await response.json();
          setSteamProfile(profile);

          // If we have profile data and not already set, update it
          if (
            (profile.loccountrycode && !steamUserInfo?.steamCountry) ||
            (profile.personaname && !steamUserInfo?.steamUsername)
          ) {
            onSteamInfoReceived({
              steamId: steamId,
              steamUsername:
                profile.personaname || steamUserInfo?.steamUsername,
              steamCountry:
                profile.loccountrycode || steamUserInfo?.steamCountry,
            });
          }
        }
      } catch (error) {
        console.error("Failed to load Steam profile:", error);
        // Fail silently as requested
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (steamUserInfo?.steamId && !steamProfile) {
      loadSteamProfile(steamUserInfo.steamId);
    }
  }, [
    steamUserInfo?.steamId,
    steamUserInfo?.steamCountry,
    steamProfile,
    onSteamInfoReceived,
  ]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      console.log("[Steam Connection] Message received");
      console.log("[Steam Connection] Event origin:", event.origin);
      console.log("[Steam Connection] Window origin:", window.location.origin);
      console.log("[Steam Connection] Message data:", event.data);

      // Relaxed origin check - allow same protocol and domain
      const eventUrl = new URL(event.origin);
      const windowUrl = new URL(window.location.origin);

      if (
        eventUrl.protocol !== windowUrl.protocol ||
        eventUrl.hostname !== windowUrl.hostname
      ) {
        console.warn("[Steam Connection] Origin mismatch, ignoring message");
        return;
      }

      const { type, steamId, steamUsername, steamCountry } = event.data || {};

      if (type === "STEAM_CONNECT_SUCCESS") {
        console.log("[Steam Connection] Success message received");
        console.log("[Steam Connection] Steam ID:", steamId);
        console.log("[Steam Connection] Username:", steamUsername);
        console.log("[Steam Connection] Country:", steamCountry);

        // Send acknowledgment back to popup
        try {
          if (event.source && "postMessage" in event.source) {
            (event.source as Window).postMessage(
              { type: "STEAM_CONNECT_ACK" },
              event.origin
            );
            console.log("[Steam Connection] Acknowledgment sent to popup");
          }
        } catch (e) {
          console.error("[Steam Connection] Failed to send acknowledgment:", e);
        }

        onSteamInfoReceived({
          steamId: steamId,
          steamUsername: steamUsername,
          steamCountry: steamCountry,
        });
      } else if (type === "STEAM_CONNECT_FAILURE") {
        console.error("[Steam Connection] Failure message received");
        alert(
          "Steam connection failed. Please try again or contact support if the issue persists."
        );
      }
    };

    // Check localStorage for fallback data on component mount
    const checkLocalStorage = () => {
      try {
        const storedData = localStorage.getItem("steam_auth_result");
        if (storedData) {
          console.log(
            "[Steam Connection] Found data in localStorage:",
            storedData
          );
          const data = JSON.parse(storedData);
          if (data.type === "STEAM_CONNECT_SUCCESS" && data.steamId) {
            console.log("[Steam Connection] Using localStorage fallback data");
            onSteamInfoReceived({
              steamId: data.steamId,
              steamUsername: data.steamUsername,
              steamCountry: data.steamCountry,
            });
            // Clear the stored data after using it
            localStorage.removeItem("steam_auth_result");
          }
        }
      } catch (e) {
        console.error("[Steam Connection] Error reading from localStorage:", e);
      }
    };

    // Check localStorage immediately and set up interval to check periodically
    checkLocalStorage();
    const interval = setInterval(checkLocalStorage, 1000);

    window.addEventListener("message", handler);
    return () => {
      window.removeEventListener("message", handler);
      clearInterval(interval);
    };
  }, [onSteamInfoReceived]);

  const handleConnect = () => {
    if (steamConnected) {
      console.log("[Steam Connection] Already connected, ignoring click");
      return; // Already connected, do nothing
    }

    console.log("[Steam Connection] Opening Steam authentication popup");

    const width = 600;
    const height = 700;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    const popup = window.open(
      "/api/steam/init",
      "SteamLogin",
      `width=${width},height=${height},top=${top},left=${left}`
    );

    if (!popup) {
      console.error(
        "[Steam Connection] Failed to open popup - likely blocked by browser"
      );
      alert(
        "Pop-up blocked! Please allow pop-ups for this site and try again."
      );
    } else {
      console.log("[Steam Connection] Popup opened successfully");
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Gamepad2 className="h-5 w-5 text-primary" />
        <Label className="text-base font-medium">
          Steam Account Integration
        </Label>
      </div>

      <div
        className="group relative p-6 bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 rounded-xl border border-primary/20 dark:border-primary/30 hover:border-primary/40 dark:hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/30"
        onClick={handleConnect}
      >
        {steamConnected ? (
          // Connected State
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-green-500/20 text-green-500">
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-600 dark:text-green-400 mb-2">
                Steam Account Connected!
              </h3>
              {steamUserInfo && (
                <div className="space-y-3 mb-3">
                  {isLoadingProfile ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Loading Steam profile...
                      </span>
                    </div>
                  ) : steamProfile ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={steamProfile.avatarmedium}
                          alt={`${steamProfile.personaname} avatar`}
                          width={40}
                          height={40}
                          className="rounded-lg border border-border/50"
                        />
                        <div className="flex flex-col">
                          {steamProfile.realname && (
                            <span className="font-medium text-foreground">
                              {steamProfile.realname}
                            </span>
                          )}
                          <a
                            href={steamProfile.profileurl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                          >
                            {steamProfile.personaname}
                          </a>
                        </div>
                      </div>
                      {(userCountry || steamProfile?.loccountrycode) && (
                        <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                          <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <div className="flex items-center gap-2">
                            {userCountry ? (
                              <>
                                <span className="text-lg">
                                  {userCountry.flag}
                                </span>
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                  {userCountry.name}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                Region: {steamProfile?.loccountrycode}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-foreground">
                        Steam ID: {steamUserInfo.steamId}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Your Steam account is now linked to your Digiphile profile.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-2 rounded-lg bg-green-500/20">
                <svg
                  className="h-6 w-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-xs font-medium text-green-500">
                Connected
              </span>
            </div>
          </div>
        ) : (
          // Not Connected State
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary group-hover:scale-110 transition-transform duration-300">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.19 0 2.34-.21 3.41-.6.3-.11.49-.4.49-.72 0-.43-.35-.78-.78-.78-.15 0-.29.04-.42.11-.86.31-1.79.47-2.7.47-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8c0 .91-.16 1.84-.47 2.7-.07.13-.11.27-.11.42 0 .43.35.78.78.78.32 0 .61-.19.72-.49.39-1.07.6-2.22.6-3.41 0-5.52-4.48-10-10-10zm0 6c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                Connect Your Steam Account
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                To purchase Steam game bundles, you need to connect your Steam
                account for verification purposes.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>Verify your identity to purchase Steam bundles</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Unlock access to Steam game bundle purchases</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>
                    Receive better customer support for your purchases
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-2 rounded-lg bg-white/50 dark:bg-muted/50 group-hover:bg-white/70 dark:group-hover:bg-muted/70 transition-colors">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
              <span className="text-xs font-medium text-primary">
                Click to Connect
              </span>
            </div>
          </div>
        )}

        <div
          className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl ${
            steamConnected
              ? "from-green-500/50 via-green-400/50 to-green-500/50"
              : "from-primary/50 via-secondary/50 to-primary/50"
          }`}
        />
      </div>

      {!steamConnected && (
        <>
          <div className="bg-muted/30 dark:bg-muted/20 rounded-lg p-4 border border-border/50">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-full bg-blue-500/20 text-blue-500 mt-0.5">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-foreground mb-1">
                  How Steam Integration Works
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We use Steam&apos;s secure OpenID authentication system.
                  You&apos;ll be redirected to Steam&apos;s official login page
                  where you can safely authorize our app. We only access your
                  public profile information and game library - we never see
                  your Steam password or personal details.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Steam integration is required to purchase Steam game bundles on
              Digiphile. Your Steam avatar, handle or name won&apos;t be shared
              publicly. We use your Steam account to verify your identity and
              enable bundle purchases.
            </p>
          </div>
        </>
      )}

      {steamConnected && (
        <div className="text-center">
          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
            Steam account successfully connected. You can now purchase Steam
            game bundles.
          </p>
        </div>
      )}
    </div>
  );
}
