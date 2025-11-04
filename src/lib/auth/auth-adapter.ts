/**
 * Auth Adapter Factory
 * Determines which auth provider to use based on environment configuration
 */

import { IAuthProvider } from "./providers/auth-provider-interface";
import { CognitoAuthProvider } from "./providers/cognito-provider";
import { TestAuthProvider } from "./providers/test-provider";

let authProviderInstance: IAuthProvider | null = null;

/**
 * Get the appropriate auth provider based on environment configuration
 * Implements singleton pattern to ensure consistent provider instance
 */
export function getAuthProvider(): IAuthProvider {
  if (authProviderInstance) {
    return authProviderInstance;
  }

  const useTestAuth = process.env.NEXT_PUBLIC_USE_TEST_AUTH === "true";

  if (useTestAuth) {
    console.log("[AuthAdapter] Using Test Auth Provider");
    authProviderInstance = new TestAuthProvider();
  } else {
    console.log("[AuthAdapter] Using Cognito Auth Provider");
    authProviderInstance = new CognitoAuthProvider();
  }

  return authProviderInstance;
}

/**
 * Reset the auth provider instance (useful for testing)
 */
export function resetAuthProvider() {
  authProviderInstance = null;
}

/**
 * Check if test auth is enabled
 */
export function isTestAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_TEST_AUTH === "true";
}
