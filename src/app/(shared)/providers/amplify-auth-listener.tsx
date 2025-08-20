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

    // Initial sync on mount (in case user is already signed in)
    const syncInitialToken = async () => {
      try {
        const session = await fetchAuthSession();
        if (session.tokens?.idToken) {
          console.log("Initial token sync on mount");
          await AuthService.syncIdToken();
        }
      } catch (error) {
        console.error("Error syncing initial token:", error);
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