/**
 * Auth Service
 * Unified authentication service that uses the appropriate auth provider
 * based on environment configuration (Cognito or Test Auth)
 */

import {
  confirmSignUp,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
  autoSignIn,
  type ConfirmSignUpInput,
  type ResendSignUpCodeInput,
  type ResetPasswordInput,
  type ConfirmResetPasswordInput,
} from "aws-amplify/auth";
import Cookies from "js-cookie";
import { getAuthProvider } from "./auth-adapter";

const ID_TOKEN_COOKIE = "id_token";

export class AuthService {
  /**
   * Sign in with email and password
   * Routes to appropriate auth provider (Cognito or Test)
   */
  static async signIn(email: string, password: string) {
    const provider = getAuthProvider();
    return provider.signIn(email, password);
  }

  /**
   * Sign up a new user
   * Routes to appropriate auth provider (Cognito or Test)
   */
  static async signUp(email: string, password: string, name?: string) {
    const provider = getAuthProvider();
    return provider.signUp(email, password, name);
  }

  /**
   * Confirm sign up with verification code
   * Note: Only works with Cognito auth
   */
  static async confirmSignUp(email: string, code: string) {
    try {
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: email,
        confirmationCode: code,
      } as ConfirmSignUpInput);

      return { success: true, isSignUpComplete, nextStep };
    } catch (error) {
      console.error("Confirm sign up error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Confirmation failed",
      };
    }
  }

  /**
   * Handle auto sign-in after registration
   * Note: Only works with Cognito auth
   */
  static async handleAutoSignIn() {
    try {
      const { isSignedIn, nextStep } = await autoSignIn();

      if (isSignedIn) {
        await this.syncIdToken();
      }

      return { success: true, isSignedIn, nextStep };
    } catch (error) {
      console.error("Auto sign-in error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Auto sign-in failed",
      };
    }
  }

  /**
   * Resend confirmation code
   * Note: Only works with Cognito auth
   */
  static async resendConfirmationCode(email: string) {
    try {
      const { destination } = await resendSignUpCode({
        username: email,
      } as ResendSignUpCodeInput);

      return {
        success: true,
        destination,
        message: "Verification code resent successfully",
      };
    } catch (error) {
      console.error("Resend confirmation code error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to resend code",
      };
    }
  }

  /**
   * Sign out the current user
   * Routes to appropriate auth provider (Cognito or Test)
   */
  static async signOut() {
    const provider = getAuthProvider();
    return provider.signOut();
  }

  /**
   * Reset password
   * Note: Only works with Cognito auth
   */
  static async resetPassword(email: string) {
    try {
      const { isPasswordReset, nextStep } = await resetPassword({
        username: email,
      } as ResetPasswordInput);

      return { success: true, isPasswordReset, nextStep };
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Password reset failed",
      };
    }
  }

  /**
   * Confirm reset password
   * Note: Only works with Cognito auth
   */
  static async confirmResetPassword(
    email: string,
    code: string,
    newPassword: string
  ) {
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      } as ConfirmResetPasswordInput);

      return { success: true };
    } catch (error) {
      console.error("Confirm reset password error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Password reset confirmation failed",
      };
    }
  }

  /**
   * Get the current authenticated user
   * Routes to appropriate auth provider (Cognito or Test)
   */
  static async getCurrentUser() {
    try {
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      const session = await fetchAuthSession();
      const customerId = session.tokens?.idToken?.payload?.['custom:customerId'] as string | undefined;

      return { success: true, user, attributes, customerId };
    } catch (error) {
      console.error("Get current user error:", error);
      return { success: false, user: null, attributes: null, customerId: undefined };
    }
  }

  static async hasCompletedProfile(): Promise<boolean> {
    const provider = getAuthProvider();
    return provider.hasCompletedProfile();
  }

  /**
   * Get the current auth session
   * Routes to appropriate auth provider (Cognito or Test)
   */
  static async getSession() {
    const provider = getAuthProvider();
    return provider.getSession();
  }

  /**
   * Sync ID token to cookie
   * Used for server-side authentication in middleware
   */
  static async syncIdToken(): Promise<void> {
    try {
      const provider = getAuthProvider();
      const idToken = await provider.getIdToken();

      if (idToken) {
        Cookies.set(ID_TOKEN_COOKIE, idToken, {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          expires: 1, // 1 day
        });
      }
    } catch (error) {
      console.error("ID token sync error:", error);
    }
  }

  /**
   * Clear ID token cookie
   */
  static clearIdToken() {
    Cookies.remove(ID_TOKEN_COOKIE);
  }

  /**
   * Refresh authentication tokens
   * Routes to appropriate auth provider (Cognito or Test)
   */
  static async refreshTokens() {
    const provider = getAuthProvider();
    const refreshed = await provider.refreshTokens();

    if (refreshed) {
      await this.syncIdToken();
    }

    return refreshed;
  }

  /**
   * Check if user is authenticated
   * Routes to appropriate auth provider (Cognito or Test)
   */
  static async isAuthenticated(): Promise<boolean> {
    const provider = getAuthProvider();
    return provider.isAuthenticated();
  }
}
