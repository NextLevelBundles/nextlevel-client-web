import Cookies from "js-cookie";

const ID_TOKEN_COOKIE = "id_token";

/**
 * Test authentication response matching backend AuthResponseDto
 */
interface TestAuthResponse {
  emailAddress: string;
  userId: string;
  tokens: {
    idToken: string;
    accessToken: string;
    expiresIn: number;
    refreshToken: string | null;
    tokenType: string;
  };
  isSuccess: boolean;
  message: string;
}

/**
 * Test Authentication Service for development/testing environments.
 * Allows login using email from Customer table without password validation.
 * Uses the backend test login endpoint to issue valid JWT tokens.
 */
export class TestAuthService {
  /**
   * Sign in using email only (no password required).
   * Queries backend Customer table and issues JWT with custom:customerId claim.
   *
   * @param email - Customer email address (must exist in Customer table)
   * @returns Auth response with JWT tokens or error
   */
  static async signInWithEmail(email: string) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7100/api";
      const testLoginUrl = `${apiUrl}/test/login`;

      console.log(`[TestAuthService] Attempting test login for email: ${email}`);

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

        console.error(`[TestAuthService] Test login failed:`, errorData);

        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data: TestAuthResponse = await response.json();

      if (!data.isSuccess || !data.tokens?.idToken) {
        console.error(`[TestAuthService] Invalid response:`, data);
        return {
          success: false,
          error: data.message || "Invalid response from test login endpoint",
        };
      }

      console.log(`[TestAuthService] Test login successful for: ${data.emailAddress}`);

      // Store ID token in cookie (same as real auth flow)
      Cookies.set(ID_TOKEN_COOKIE, data.tokens.idToken, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: 1, // 1 day
      });

      // Also store access token for API calls
      if (data.tokens.accessToken) {
        Cookies.set("access_token", data.tokens.accessToken, {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          expires: 1,
        });
      }

      console.log(`[TestAuthService] Tokens stored in cookies`);

      return {
        success: true,
        isSignedIn: true,
        user: {
          email: data.emailAddress,
          userId: data.userId,
        },
        tokens: data.tokens,
      };
    } catch (error) {
      console.error("[TestAuthService] Test login error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Test login failed",
      };
    }
  }

  /**
   * Check if test authentication is enabled for current environment
   */
  static isEnabled(): boolean {
    console.log("Test auth enabled:", process.env.NEXT_PUBLIC_USE_TEST_AUTH);
    return process.env.NEXT_PUBLIC_USE_TEST_AUTH === "true";
  }

  /**
   * Get the current test auth configuration
   */
  static getConfig() {
    return {
      enabled: this.isEnabled(),
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
      testLoginEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/test/login`,
    };
  }

  /**
   * Sign out (clear cookies)
   */
  static signOut() {
    Cookies.remove(ID_TOKEN_COOKIE);
    Cookies.remove("access_token");
    console.log("[TestAuthService] Signed out, cookies cleared");
  }

  /**
   * Get current ID token from cookie
   */
  static getIdToken(): string | undefined {
    return Cookies.get(ID_TOKEN_COOKIE);
  }

  /**
   * Check if user is authenticated (has valid token in cookie)
   */
  static isAuthenticated(): boolean {
    return !!this.getIdToken();
  }
}
