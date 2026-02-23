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
  rememberDevice,
  forgetDevice,
  fetchDevices,
  type SignInInput,
  type SignUpInput,
  type ConfirmSignUpInput,
  type ResendSignUpCodeInput,
  type ResetPasswordInput,
  type ConfirmResetPasswordInput,
  type UpdatePasswordInput,
  type FetchDevicesOutput,
} from "aws-amplify/auth";
import Cookies from "js-cookie";

const ID_TOKEN_COOKIE = "id_token";

// Password special characters as per Cognito requirements
// ^ $ * . [ ] { } ( ) ? - " ! @ # % & / \ , > < ' : ; | _ ~ ` + =
// Non-leading, non-trailing spaces are also treated as special characters
const PASSWORD_SPECIAL_CHARS = /[\^$*.\[\]{}()?\-"!@#%&/\\,><':;|_~`+=]/;

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  checks: {
    hasMinLength: boolean;
    hasNumber: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasSpecialChar: boolean;
  };
}

/**
 * Validates a password against Cognito password policy requirements:
 * - At least 8 characters
 * - Contains at least 1 number
 * - Contains at least 1 uppercase letter
 * - Contains at least 1 lowercase letter
 * - Contains at least 1 special character from: ^ $ * . [ ] { } ( ) ? - " ! @ # % & / \ , > < ' : ; | _ ~ ` + =
 * - Non-leading, non-trailing spaces are also treated as special characters
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  const hasMinLength = password.length >= 8;
  const hasNumber = /[0-9]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  // Check for special characters OR non-leading, non-trailing space
  const hasSpecialChar = PASSWORD_SPECIAL_CHARS.test(password) ||
    (password.includes(' ') && !password.startsWith(' ') && !password.endsWith(' '));

  if (!hasMinLength) {
    errors.push("Password must be at least 8 characters");
  }
  if (!hasNumber) {
    errors.push("Password must contain at least 1 number");
  }
  if (!hasUppercase) {
    errors.push("Password must contain at least 1 uppercase letter");
  }
  if (!hasLowercase) {
    errors.push("Password must contain at least 1 lowercase letter");
  }
  if (!hasSpecialChar) {
    errors.push("Password must contain at least 1 special character (^ $ * . [ ] { } ( ) ? - \" ! @ # % & / \\ , > < ' : ; | _ ~ ` + =)");
  }

  return {
    isValid: errors.length === 0,
    errors,
    checks: {
      hasMinLength,
      hasNumber,
      hasUppercase,
      hasLowercase,
      hasSpecialChar,
    },
  };
}

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

  /**
   * Sign in with USER_SRP_AUTH flow - required for device tracking to work.
   * This flow properly returns NewDeviceMetadata which enables MFA suppression
   * for remembered devices.
   */
  static async signInWithSRP(email: string, password: string) {
    try {
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password,
        options: {
          authFlowType: "USER_SRP_AUTH",
        },
      });

      if (isSignedIn) {
        await this.syncIdToken();
      }

      return { success: true, isSignedIn, nextStep };
    } catch (error) {
      console.error("Sign in with SRP error:", error);
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

      // Detect unverified user - Cognito can't reset password without verified email
      const errorMessage = error instanceof Error ? error.message : "";
      if (
        errorMessage.includes("no registered/verified email") ||
        (error instanceof Error && error.name === "InvalidParameterException")
      ) {
        return {
          success: false,
          isUserNotVerified: true,
          error: errorMessage || "Password reset failed",
        };
      }

      return {
        success: false,
        error: errorMessage || "Password reset failed",
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
      // Note: We avoid calling signOut() here because it clears the device key
      // from local storage, which breaks the "remember device" functionality.
      // The USER_AUTH flow handles session management automatically.

      const { isSignedIn, nextStep } = await signIn({
        username: email,
        options: {
          authFlowType: "USER_AUTH",
        },
      });

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

      if (nextStep && nextStep.signInStep === "CONTINUE_SIGN_IN_WITH_FIRST_FACTOR_SELECTION") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const step = nextStep as any;

        // availableChallenges is directly on nextStep
        if (step.availableChallenges) {
          availableChallenges = step.availableChallenges;
        }
      }

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

      const { isSignedIn, nextStep } = await confirmSignIn({
        challengeResponse: factor,
      });

      if (isSignedIn) {
        await this.syncIdToken();
      }

      return { success: true, isSignedIn, nextStep };
    } catch (error) {

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
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete passkey",
      };
    }
  }

  // Device Remembering Methods

  /**
   * Remember the current device to skip MFA for 30 days.
   * Should be called after successful MFA verification when user opts in.
   */
  static async rememberCurrentDevice() {
    try {
      await rememberDevice();
      return { success: true };
    } catch (error) {
      console.error("Remember device error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to remember device",
      };
    }
  }

  /**
   * Forget the current device, requiring MFA on next login.
   */
  static async forgetCurrentDevice() {
    try {
      await forgetDevice();
      return { success: true };
    } catch (error) {
      console.error("Forget device error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to forget device",
      };
    }
  }

  /**
   * Get list of all remembered devices for the current user.
   */
  static async listRememberedDevices(): Promise<{
    success: boolean;
    devices: FetchDevicesOutput;
    error?: string;
  }> {
    try {
      const devices = await fetchDevices();
      return { success: true, devices };
    } catch (error) {
      console.error("List devices error:", error);
      return {
        success: false,
        devices: [],
        error: error instanceof Error ? error.message : "Failed to list devices",
      };
    }
  }
}
