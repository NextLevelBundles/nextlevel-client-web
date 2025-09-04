import { JWTPayload, jwtVerify, createRemoteJWKSet, decodeJwt } from "jose";

// Define the decoded token interface
export interface DecodedToken extends JWTPayload {
  email?: string;
  name?: string;
  sub?: string;
  "cognito:username"?: string;
  email_verified?: boolean;
  "custom:customerId"?: string;
  [key: string]: any;
}

// Cache the JWKS client at module level for reuse
let jwksClient: ReturnType<typeof createRemoteJWKSet> | null = null;

/**
 * Get or create the JWKS client for token verification
 * This client caches the keys and only refetches when needed
 */
function getJWKSClient() {
  if (!jwksClient) {
    const issuer =
      process.env.AUTH_COGNITO_ISSUER ||
      process.env.NEXT_PUBLIC_AUTH_COGNITO_ISSUER;
    if (!issuer) {
      throw new Error("Cognito issuer not configured");
    }
    const jwksUri = `${issuer}/.well-known/jwks.json`;
    console.log("jwksUri", jwksUri);
    jwksClient = createRemoteJWKSet(new URL(jwksUri));
  }
  return jwksClient;
}

/**
 * Verify and decode a JWT token with full validation
 * Checks signature, issuer, audience, and expiration
 */
export async function verifyToken(token: string): Promise<DecodedToken | null> {
  try {
    const jwks = getJWKSClient();
    const issuer =
      process.env.AUTH_COGNITO_ISSUER ||
      process.env.NEXT_PUBLIC_AUTH_COGNITO_ISSUER;
    const audience =
      process.env.AUTH_COGNITO_ID || process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

    if (!issuer || !audience) {
      console.error(
        "Missing required environment variables for token validation"
      );
      return null;
    }

    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      audience,
    });

    return payload as DecodedToken;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Quick decode without verification - USE ONLY when verification is not needed
 * This is much faster but provides no security guarantees
 */
export function decodeTokenUnsafe(token: string): DecodedToken | null {
  try {
    return decodeJwt(token) as DecodedToken;
  } catch (error) {
    console.error("Token decode failed:", error);
    return null;
  }
}

/**
 * Check if a decoded token is expired
 */
export function isTokenExpired(token: DecodedToken): boolean {
  if (!token.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return now >= token.exp;
}

/**
 * Check if a token will expire soon (within specified seconds)
 */
export function isTokenExpiringSoon(
  token: DecodedToken,
  bufferSeconds: number = 120
): boolean {
  if (!token.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return token.exp - now < bufferSeconds;
}

/**
 * Extract user information from a decoded token
 */
export function extractUserFromToken(token: DecodedToken) {
  return {
    id: token.sub,
    email: token.email,
    name: token.name,
    emailVerified: token.email_verified,
    customerId: token["custom:customerId"],
  };
}
