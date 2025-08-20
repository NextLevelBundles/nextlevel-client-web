import {
  signIn,
  signUp,
  signOut,
  confirmSignUp,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
  fetchAuthSession,
  fetchUserAttributes,
  autoSignIn,
  type SignInInput,
  type SignUpInput,
  type ConfirmSignUpInput,
  type ResendSignUpCodeInput,
  type ResetPasswordInput,
  type ConfirmResetPasswordInput,
} from "aws-amplify/auth";
import Cookies from "js-cookie";

const ID_TOKEN_COOKIE = "id_token";

export class AuthService {
  static async signIn(email: string, password: string) {
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
      console.error("Sign in error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sign in failed",
      };
    }
  }

  static async signUp(email: string, password: string, name?: string) {
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

      return { success: true, isSignUpComplete, userId, nextStep };
    } catch (error) {
      console.error("Sign up error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sign up failed",
      };
    }
  }

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

  static async handleAutoSignIn() {
    try {
      const { isSignedIn, nextStep } = await autoSignIn();
      
      // If auto sign-in is successful, sync the ID token
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

  static async signOut() {
    try {
      await signOut();
      this.clearIdToken();
      return { success: true };
    } catch (error) {
      console.error("Sign out error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Sign out failed",
      };
    }
  }

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

  static async getCurrentUser() {
    try {
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      return { success: true, user, attributes };
    } catch (error) {
      console.error("Get current user error:", error);
      return { success: false, user: null, attributes: null };
    }
  }

  static async getSession() {
    try {
      const session = await fetchAuthSession();
      return session;
    } catch (error) {
      console.error("Get session error:", error);
      return null;
    }
  }

  static async syncIdToken(): Promise<void> {
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      if (idToken) {
        // Only store ID token in cookie for server-side auth
        // Amplify manages all tokens in localStorage for client-side
        Cookies.set(ID_TOKEN_COOKIE, idToken, {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax", // Allow cookie to be sent on navigation
          expires: 1, // 1 day
        });
      }
    } catch (error) {
      console.error("ID token sync error:", error);
    }
  }

  static clearIdToken() {
    Cookies.remove(ID_TOKEN_COOKIE);
  }

  static async refreshTokens() {
    try {
      const session = await fetchAuthSession({ forceRefresh: true });
      if (session.tokens) {
        await this.syncIdToken();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    try {
      const session = await fetchAuthSession();
      return !!session.tokens?.idToken;
    } catch {
      return false;
    }
  }
}
