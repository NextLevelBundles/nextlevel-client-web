"use client";

import { useEffect } from "react";
import { Hub } from "aws-amplify/utils";
import { fetchAuthSession } from "aws-amplify/auth";
import { AuthService } from "@/lib/auth/auth-service";

export function AmplifyAuthListener() {
  useEffect(() => {
    // Listen for auth events from Amplify Hub
    const hubListener = Hub.listen("auth", async ({ payload }) => {
      console.log("Auth event:", payload.event);

      switch (payload.event) {
        case "signedIn":
          console.log("User signed in, syncing ID token to cookie");
          await AuthService.syncIdToken();
          break;

        case "tokenRefresh":
          console.log("Tokens refreshed by Amplify, syncing ID token to cookie");
          await AuthService.syncIdToken();
          break;

        case "signedOut":
          console.log("User signed out, clearing ID token cookie");
          AuthService.clearIdToken();
          break;

        case "tokenRefresh_failure":
          console.log("Token refresh failed, clearing ID token cookie");
          AuthService.clearIdToken();
          break;
      }
    });

    // Initial sync on mount with retry mechanism for mobile browsers
    // Mobile browsers may take longer to hydrate localStorage
    const syncInitialToken = async (retryCount = 0, maxRetries = 3) => {
      try {
        const session = await fetchAuthSession();
        if (session.tokens?.idToken) {
          console.log("Initial token sync on mount (attempt", retryCount + 1, ")");
          await AuthService.syncIdToken();
        } else if (retryCount < maxRetries) {
          // No token yet, retry after a delay
          const delay = 150 * (retryCount + 1); // 150ms, 300ms, 450ms
          console.log(`No token found, retrying in ${delay}ms`);
          setTimeout(() => syncInitialToken(retryCount + 1, maxRetries), delay);
        }
      } catch (error) {
        // Only retry if it's not an authentication error
        if (error instanceof Error && !error.message.includes("User needs to be authenticated")) {
          console.error("Error syncing initial token:", error);
          if (retryCount < maxRetries) {
            const delay = 150 * (retryCount + 1);
            console.log(`Retrying token sync in ${delay}ms`);
            setTimeout(() => syncInitialToken(retryCount + 1, maxRetries), delay);
          }
        }
      }
    };

    syncInitialToken();

    // Cleanup listener on unmount
    return () => {
      hubListener();
    };
  }, []);

  return null; // This component doesn't render anything
}