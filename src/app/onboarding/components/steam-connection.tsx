import { Label } from "@/app/(shared)/components/ui/label";
import { Gamepad2, Loader2 } from "lucide-react";
import { SteamUserInfo } from "./onboarding-form";
import { useEffect, useState } from "react";
import Image from "next/image";

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

  // Load Steam profile when we have a Steam ID
  useEffect(() => {
    const loadSteamProfile = async (steamId: string) => {
      setIsLoadingProfile(true);
      try {
        const response = await fetch(`/api/steam/profile?steamid=${steamId}`);
        if (response.ok) {
          const profile = await response.json();
          setSteamProfile(profile);
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
  }, [steamUserInfo?.steamId, steamProfile]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const { type, steamId } = event.data || {};

      if (type === "STEAM_CONNECT_SUCCESS") {
        onSteamInfoReceived({
          steamId: steamId,
        });
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onSteamInfoReceived]);

  const handleConnect = () => {
    if (steamConnected) {
      return; // Already connected, do nothing
    }

    const width = 600;
    const height = 700;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    window.open(
      "/api/steam/init",
      "SteamLogin",
      `width=${width},height=${height},top=${top},left=${left}`
    );
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
              <h3 className="font-rajdhani text-lg font-bold text-green-600 dark:text-green-400 mb-2">
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
                Your Steam account is now linked and ready for automatic game
                delivery.
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
              <h3 className="font-rajdhani text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                Connect Your Steam Account
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Link your Steam account to automatically receive game keys, sync
                your library, and get personalized recommendations based on your
                gaming preferences.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>Automatic game key delivery to your Steam library</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Personalized bundle recommendations</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>Track your gaming achievements and stats</span>
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
              Steam integration is mandatory to become part of our gaming
              community and enjoy the full Digiphile experience. Your Steam
              avatar, handle or name won&apos;t be shared publicly, and we only
              use your Steam ID to deliver game keys and provide personalized
              recommendations.
            </p>
          </div>
        </>
      )}

      {steamConnected && (
        <div className="text-center">
          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
            Steam account successfully connected and ready for game delivery
          </p>
        </div>
      )}
    </div>
  );
}
