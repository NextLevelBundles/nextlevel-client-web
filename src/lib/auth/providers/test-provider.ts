/**
 * Test Auth Provider
 * Implements authentication using the test login API (no password validation)
 * Uses JWT tokens from backend test endpoint
 */

import Cookies from "js-cookie";
import { IAuthProvider, AuthUser, AuthResult } from "./auth-provider-interface";
import { decodeTokenUnsafe } from "../token-validator";

const ID_TOKEN_COOKIE = "id_token";
const ACCESS_TOKEN_COOKIE = "access_token";

export class TestAuthProvider implements IAuthProvider {
  async signIn(email: string, _password: string): Promise<AuthResult> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7100/api";
      const testLoginUrl = `${apiUrl}/test/login`;

      console.log(`[TestProvider] Attempting test login for email: ${email}`);

      const response = await fetch(testLoginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "unknown_error",
          message: "Test login failed",
        }));

        console.error(`[TestProvider] Test login failed:`, errorData);

        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();

      if (!data.isSuccess || !data.tokens?.idToken) {
        console.error(`[TestProvider] Invalid response:`, data);
        return {
          success: false,
          error: data.message || "Invalid response from test login endpoint",
        };
      }

      console.log(`[TestProvider] Test login successful for: ${data.emailAddress}`);

      // Store tokens in cookies
      Cookies.set(ID_TOKEN_COOKIE, data.tokens.idToken, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: 1,
      });

      if (data.tokens.accessToken) {
        Cookies.set(ACCESS_TOKEN_COOKIE, data.tokens.accessToken, {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          expires: 1,
        });
      }

      console.log(`[TestProvider] Tokens stored in cookies`);

      return {
        success: true,
        isSignedIn: true,
        user: {
          userId: data.userId,
          username: data.emailAddress,
          email: data.emailAddress,
          emailVerified: true,
        },
      };
    } catch (error) {
      console.error("[TestProvider] Test login error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Test login failed",
      };
    }
  }

  async signUp(_email: string, _password: string, _name?: string): Promise<AuthResult> {
    // Sign up not supported in test mode
    return {
      success: false,
      error: "Sign up is not supported in test auth mode",
    };
  }

  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      Cookies.remove(ID_TOKEN_COOKIE);
      Cookies.remove(ACCESS_TOKEN_COOKIE);
      console.log("[TestProvider] Signed out, cookies cleared");
      return { success: true };
    } catch (error) {
      console.error("[TestProvider] Sign out error:", error);
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
      const idToken = Cookies.get(ID_TOKEN_COOKIE);

      if (!idToken) {
        return { success: false, user: null, attributes: null };
      }

      const decoded = decodeTokenUnsafe(idToken);

      if (!decoded) {
        return { success: false, user: null, attributes: null };
      }

      const user: AuthUser = {
        userId: decoded.sub || "",
        username: decoded.email || "",
        email: decoded.email,
        name: decoded.name,
        emailVerified: decoded.email_verified || true,
        attributes: {
          email: decoded.email || "",
          name: decoded.name || "",
          email_verified: decoded.email_verified ? "true" : "false",
          "custom:customerId": decoded["custom:customerId"] || "",
        },
      };

      return {
        success: true,
        user,
        attributes: user.attributes,
      };
    } catch (error) {
      console.error("[TestProvider] Get current user error:", error);
      return { success: false, user: null, attributes: null };
    }
  }

  async getSession() {
    try {
      const idToken = Cookies.get(ID_TOKEN_COOKIE);
      const accessToken = Cookies.get(ACCESS_TOKEN_COOKIE);

      if (!idToken) {
        return null;
      }

      return {
        tokens: {
          idToken: { toString: () => idToken },
          accessToken: accessToken ? { toString: () => accessToken } : undefined,
        },
      };
    } catch (error) {
      console.error("[TestProvider] Get session error:", error);
      return null;
    }
  }

  async getIdToken(): Promise<string | null> {
    const idToken = Cookies.get(ID_TOKEN_COOKIE);
    return idToken || null;
  }

  async isAuthenticated(): Promise<boolean> {
    const idToken = Cookies.get(ID_TOKEN_COOKIE);
    return !!idToken;
  }

  async refreshTokens(): Promise<boolean> {
    // Token refresh not implemented for test auth
    // Tokens are short-lived in test mode
    console.warn("[TestProvider] Token refresh not supported in test auth mode");
    return false;
  }

  async hasCompletedProfile(): Promise<boolean> {
    try {
      const idToken = Cookies.get(ID_TOKEN_COOKIE);

      if (!idToken) return false;

      const decoded = decodeTokenUnsafe(idToken);

      if (!decoded) return false;

      // Check if the ID token has the custom:customerId claim
      const customerId = decoded["custom:customerId"];
      return !!customerId;
    } catch (error) {
      console.error("[TestProvider] Error checking profile completion:", error);
      return false;
    }
  }
}
