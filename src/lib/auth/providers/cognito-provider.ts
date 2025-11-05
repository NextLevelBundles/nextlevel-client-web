/**
 * Cognito Auth Provider
 * Implements authentication using AWS Amplify and Cognito
 */

import {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  fetchUserAttributes,
  type SignInInput,
  type SignUpInput,
} from "aws-amplify/auth";
import Cookies from "js-cookie";
import { IAuthProvider, AuthUser, AuthResult } from "./auth-provider-interface";

const ID_TOKEN_COOKIE = "id_token";

export class CognitoAuthProvider implements IAuthProvider {
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password,
      } as SignInInput);

      if (isSignedIn) {
        await this.syncIdToken();
      }

      return { success: true, isSignedIn, nextStep };
    } catch (error) {
      console.error("[CognitoProvider] Sign in error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sign in failed",
      };
    }
  }

  async signUp(email: string, password: string, name?: string): Promise<AuthResult> {
    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name: name || "",
          },
          autoSignIn: true,
        },
      } as SignUpInput);

      return { success: true, isSignedIn: isSignUpComplete, nextStep };
    } catch (error) {
      console.error("[CognitoProvider] Sign up error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sign up failed",
      };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      await signOut();
      this.clearIdToken();
      return { success: true };
    } catch (error) {
      console.error("[CognitoProvider] Sign out error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sign out failed",
      };
    }
  }

  async getCurrentUser(): Promise<{
    success: boolean;
    user: AuthUser | null;
    attributes: Record<string, string> | null;
  }> {
    try {
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();

      const authUser: AuthUser = {
        userId: user.userId,
        username: user.username,
        email: attributes.email,
        name: attributes.name,
        emailVerified: attributes.email_verified === "true",
        attributes: attributes as Record<string, string>,
      };

      return { success: true, user: authUser, attributes: attributes as Record<string, string> };
    } catch (error) {
      console.error("[CognitoProvider] Get current user error:", error);
      return { success: false, user: null, attributes: null };
    }
  }

  async getSession() {
    try {
      const session = await fetchAuthSession();
      return session;
    } catch (error) {
      console.error("[CognitoProvider] Get session error:", error);
      return null;
    }
  }

  async getIdToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString() || null;
    } catch (error) {
      console.error("[CognitoProvider] Get ID token error:", error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await fetchAuthSession();
      return !!session.tokens?.idToken;
    } catch {
      return false;
    }
  }

  async refreshTokens(): Promise<boolean> {
    try {
      const session = await fetchAuthSession({ forceRefresh: true });
      if (session.tokens) {
        await this.syncIdToken();
        return true;
      }
      return false;
    } catch (error) {
      console.error("[CognitoProvider] Token refresh error:", error);
      return false;
    }
  }

  async hasCompletedProfile(): Promise<boolean> {
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken;

      if (!idToken) return false;

      // Check if the ID token has the custom:customerId claim
      const customerId = idToken.payload?.["custom:customerId"];
      return !!customerId;
    } catch (error) {
      console.error("[CognitoProvider] Error checking profile completion:", error);
      return false;
    }
  }

  private async syncIdToken(): Promise<void> {
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      if (idToken) {
        Cookies.set(ID_TOKEN_COOKIE, idToken, {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          expires: 1, // 1 day
        });
      }
    } catch (error) {
      console.error("[CognitoProvider] ID token sync error:", error);
    }
  }

  private clearIdToken() {
    Cookies.remove(ID_TOKEN_COOKIE);
  }
}
