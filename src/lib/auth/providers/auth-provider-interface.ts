/**
 * Auth Provider Interface
 * Defines the contract that all auth providers (Cognito, Test, etc.) must implement
 */

export interface AuthUser {
  userId: string;
  username: string;
  email?: string;
  name?: string;
  emailVerified?: boolean;
  attributes?: Record<string, string>;
}

export interface AuthTokens {
  idToken: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface AuthResult {
  success: boolean;
  isSignedIn?: boolean;
  user?: AuthUser;
  error?: string;
  nextStep?: any;
}

export interface IAuthProvider {
  /**
   * Sign in with email and password
   */
  signIn(email: string, password: string): Promise<AuthResult>;

  /**
   * Sign up a new user
   */
  signUp(email: string, password: string, name?: string): Promise<AuthResult>;

  /**
   * Sign out the current user
   */
  signOut(): Promise<{ success: boolean; error?: string }>;

  /**
   * Get the currently authenticated user
   */
  getCurrentUser(): Promise<{
    success: boolean;
    user: AuthUser | null;
    attributes: Record<string, string> | null;
  }>;

  /**
   * Get the current auth session/tokens
   */
  getSession(): Promise<any>;

  /**
   * Get the ID token for API authentication
   */
  getIdToken(): Promise<string | null>;

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): Promise<boolean>;

  /**
   * Refresh authentication tokens
   */
  refreshTokens(): Promise<boolean>;

  /**
   * Check if user has completed profile setup
   */
  hasCompletedProfile(): Promise<boolean>;
}
