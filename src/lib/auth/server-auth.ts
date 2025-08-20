import { cookies } from "next/headers";
import { JWTPayload, jwtVerify, createRemoteJWKSet } from "jose";

const JWKS_URI = `${process.env.AUTH_COGNITO_ISSUER}/.well-known/jwks.json`;

const jwks = createRemoteJWKSet(new URL(JWKS_URI));

export interface DecodedToken extends JWTPayload {
  email?: string;
  name?: string;
  sub?: string;
  "cognito:username"?: string;
  email_verified?: boolean;
  "custom:customerId"?: string;
  [key: string]: any; // Allow for other custom claims
}

export async function verifyIdToken(
  token: string
): Promise<DecodedToken | null> {
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: process.env.AUTH_COGNITO_ISSUER,
      audience: process.env.AUTH_COGNITO_ID,
    });

    return payload as DecodedToken;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export function isTokenExpired(token: DecodedToken): boolean {
  if (!token.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return now >= token.exp;
}

export async function getServerSession() {
  const cookieStore = await cookies();
  const idToken = cookieStore.get("id_token")?.value;

  if (!idToken) {
    return null;
  }

  const decoded = await verifyIdToken(idToken);
  if (!decoded) {
    return null;
  }

  // Check if token is expired
  if (isTokenExpired(decoded)) {
    return { expired: true };
  }

  return {
    user: {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      emailVerified: decoded.email_verified,
    },
    customClaims: {
      "custom:customerId": decoded["custom:customerId"],
    },
    expires: decoded.exp
      ? new Date(decoded.exp * 1000).toISOString()
      : undefined,
  };
}

export async function requireAuth() {
  const session = await getServerSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}
