import {
  signIn,
  signUp,
  signOut,
  confirmSignUp,
  confirmSignIn,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
  updatePassword,
  getCurrentUser,
  fetchAuthSession,
  fetchUserAttributes,
  autoSignIn,
  fetchMFAPreference,
  updateMFAPreference,
  setUpTOTP,
  verifyTOTPSetup,
  associateWebAuthnCredential,
  listWebAuthnCredentials,
  deleteWebAuthnCredential,
  type SignInInput,
  type SignUpInput,
  type ConfirmSignUpInput,
  type ResendSignUpCodeInput,
  type ResetPasswordInput,
  type ConfirmResetPasswordInput,
  type UpdatePasswordInput,
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

  static async updatePassword(oldPassword: string, newPassword: string) {
    try {
      await updatePassword({
        oldPassword,
        newPassword,
      } as UpdatePasswordInput);

      return { success: true };
    } catch (error) {
      console.error("Update password error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Password update failed",
      };
    }
  }

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
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken;
      
      if (!idToken) return false;
      
      // Check if the ID token has the custom:customerId claim
      const customerId = idToken.payload?.['custom:customerId'];
      return !!customerId;
    } catch (error) {
      console.error("Error checking profile completion:", error);
      return false;
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

  // MFA Methods
  static async confirmSignInWithMFA(code: string) {
    try {
      const { isSignedIn, nextStep } = await confirmSignIn({
        challengeResponse: code,
      });

      if (isSignedIn) {
        await this.syncIdToken();
      }

      return { success: true, isSignedIn, nextStep };
    } catch (error) {
      console.error("Confirm sign in with MFA error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "MFA verification failed",
      };
    }
  }

  static async getMFAPreference() {
    try {
      const { enabled, preferred } = await fetchMFAPreference();
      return { success: true, enabled, preferred };
    } catch (error) {
      console.error("Get MFA preference error:", error);
      return {
        success: false,
        enabled: undefined,
        preferred: undefined,
        error: error instanceof Error ? error.message : "Failed to get MFA preference",
      };
    }
  }

  static async setMFAPreference(
    emailMFA: "ENABLED" | "DISABLED" | "PREFERRED" | "NOT_PREFERRED" | undefined,
    totpMFA: "ENABLED" | "DISABLED" | "PREFERRED" | "NOT_PREFERRED" | undefined
  ) {
    try {
      await updateMFAPreference({
        email: emailMFA,
        totp: totpMFA,
      });
      return { success: true };
    } catch (error) {
      console.error("Set MFA preference error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update MFA preference",
      };
    }
  }

  static async setupTOTP() {
    try {
      const totpSetupDetails = await setUpTOTP();
      const sharedSecret = totpSetupDetails.sharedSecret;
      return { success: true, sharedSecret, totpSetupDetails };
    } catch (error) {
      console.error("Setup TOTP error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to setup TOTP",
      };
    }
  }

  static async verifyTOTP(code: string) {
    try {
      await verifyTOTPSetup({ code });
      return { success: true };
    } catch (error) {
      console.error("Verify TOTP error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to verify TOTP code",
      };
    }
  }

  // Auth Methods Discovery (USER_AUTH flow)

  /**
   * Initiates USER_AUTH flow to discover available authentication methods.
   * This starts a sign-in session that must be continued with confirmSignIn.
   */
  static async discoverAuthMethods(email: string) {
    try {
      // Clear any existing partial sign-in session to avoid "session can only be used once" errors
      try {
        await signOut();
      } catch {
        // Ignore signOut errors - user might not be in a sign-in flow
      }

      const { isSignedIn, nextStep } = await signIn({
        username: email,
        options: {
          authFlowType: "USER_AUTH",
        },
      });

      // Log the full response for debugging
      console.log("discoverAuthMethods - isSignedIn:", isSignedIn);
      console.log("discoverAuthMethods - nextStep:", JSON.stringify(nextStep, null, 2));

      // If somehow signed in directly (shouldn't happen), handle it
      if (isSignedIn) {
        await this.syncIdToken();
        return {
          success: true,
          isSignedIn: true,
          availableChallenges: [] as string[],
          nextStep
        };
      }

      // Extract available challenges from the response
      let availableChallenges: string[] = [];

      // Log the nextStep structure to understand what Amplify returns
      console.log("nextStep.signInStep:", nextStep?.signInStep);

      if (nextStep && nextStep.signInStep === "CONTINUE_SIGN_IN_WITH_FIRST_FACTOR_SELECTION") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const step = nextStep as any;

        // availableChallenges is directly on nextStep
        if (step.availableChallenges) {
          availableChallenges = step.availableChallenges;
          console.log("Extracted availableChallenges:", availableChallenges);
        }
      }

      console.log("Final availableChallenges:", availableChallenges);

      return {
        success: true,
        isSignedIn: false,
        availableChallenges,
        nextStep,
        hasPasskey: availableChallenges.includes("WEB_AUTHN"),
        hasPassword: availableChallenges.includes("PASSWORD") || availableChallenges.includes("PASSWORD_SRP"),
        hasEmailOTP: availableChallenges.includes("EMAIL_OTP"),
        hasSmsOTP: availableChallenges.includes("SMS_OTP"),
      };
    } catch (error) {
      console.error("Discover auth methods error:", error);
      return {
        success: false,
        isSignedIn: false,
        availableChallenges: [] as string[],
        hasPasskey: false,
        hasPassword: false,
        error: error instanceof Error ? error.message : "Failed to discover auth methods",
      };
    }
  }

  /**
   * Selects a first factor (PASSWORD_SRP or WEB_AUTHN) to continue sign-in.
   * Must be called after discoverAuthMethods.
   */
  static async selectFirstFactor(factor: "PASSWORD_SRP" | "WEB_AUTHN" | "EMAIL_OTP" | "SMS_OTP") {
    try {
      console.log("selectFirstFactor - calling confirmSignIn with:", factor);
      const { isSignedIn, nextStep } = await confirmSignIn({
        challengeResponse: factor,
      });

      console.log("selectFirstFactor - isSignedIn:", isSignedIn);
      console.log("selectFirstFactor - nextStep:", JSON.stringify(nextStep, null, 2));

      if (isSignedIn) {
        await this.syncIdToken();
      }

      return { success: true, isSignedIn, nextStep };
    } catch (error) {
      console.error("Select first factor error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to select authentication method",
      };
    }
  }

  /**
   * Submits the password after selecting PASSWORD_SRP.
   * The nextStep after selectFirstFactor("PASSWORD_SRP") should be CONFIRM_SIGN_IN_WITH_PASSWORD.
   */
  static async submitPasswordForUserAuth(password: string) {
    try {
      const { isSignedIn, nextStep } = await confirmSignIn({
        challengeResponse: password,
      });

      if (isSignedIn) {
        await this.syncIdToken();
      }

      return { success: true, isSignedIn, nextStep };
    } catch (error) {
      console.error("Submit password error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Incorrect password",
      };
    }
  }

  // WebAuthn/Passkey Methods

  static async signInWithPasskey(email: string) {
    try {
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        options: {
          authFlowType: "USER_AUTH",
          preferredChallenge: "WEB_AUTHN",
        },
      });

      if (isSignedIn) {
        await this.syncIdToken();
      }

      return { success: true, isSignedIn, nextStep };
    } catch (error) {
      console.error("Sign in with passkey error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Passkey sign in failed",
      };
    }
  }

  static async registerPasskey() {
    try {
      await associateWebAuthnCredential();
      return { success: true };
    } catch (error) {
      console.error("Register passkey error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to register passkey",
      };
    }
  }

  static async listPasskeys() {
    try {
      const result = await listWebAuthnCredentials();
      return { success: true, credentials: result.credentials };
    } catch (error) {
      console.error("List passkeys error:", error);
      return {
        success: false,
        credentials: [],
        error: error instanceof Error ? error.message : "Failed to list passkeys",
      };
    }
  }

  static async deletePasskey(credentialId: string) {
    try {
      await deleteWebAuthnCredential({ credentialId });
      return { success: true };
    } catch (error) {
      console.error("Delete passkey error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete passkey",
      };
    }
  }
}
