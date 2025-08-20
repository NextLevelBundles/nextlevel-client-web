import { cookies } from "next/headers";
import { 
  verifyToken, 
  isTokenExpired, 
  extractUserFromToken,
  type DecodedToken 
} from "./token-validator";

// Re-export for backward compatibility
export type { DecodedToken };
export { isTokenExpired };

// Wrapper for backward compatibility
export async function verifyIdToken(
  token: string
): Promise<DecodedToken | null> {
  return verifyToken(token);
}

export async function getServerSession() {
  const cookieStore = await cookies();
  const idToken = cookieStore.get("id_token")?.value;

  if (!idToken) {
    return null;
  }

  const decoded = await verifyToken(idToken);
  if (!decoded) {
    return null;
  }

  // Check if token is expired
  if (isTokenExpired(decoded)) {
    return { expired: true };
  }

  const user = extractUserFromToken(decoded);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
    },
    customClaims: {
      "custom:customerId": user.customerId,
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
