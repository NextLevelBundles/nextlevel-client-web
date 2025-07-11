/* eslint-disable @typescript-eslint/no-explicit-any */
import Cognito from "next-auth/providers/cognito";
import NextAuth from "next-auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Cognito({
      authorization: {
        params: {
          scope: "aws.cognito.signin.user.admin email openid phone profile",
        },
      },
      profile(profile) {
        return profile;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt(jwtData) {
      // console.log("JWT Callback Data:", jwtData);
      const { token, user, account, session, trigger } = jwtData;
      let newJwtData = { ...token, ...user, ...account, ...session };

      const shouldRefreshToken =
        token.expires_at &&
        Date.now() >= token.expires_at * 1000 - 4 * 60 * 1000; // Refresh if token is expiring in less than 4 minutes

      console.log(
        "JWT Callback - shouldRefreshToken:",
        shouldRefreshToken,
        Date.now(),
        token.expires_at! * 1000
      );
      if (trigger == "update" || shouldRefreshToken) {
        console.log("Refreshing Cognito token...");
        const cognitoTokensResponse = await refreshCognitoToken(
          token.refresh_token ?? ""
        );

        const idTokenClaims = decodeIdTokenClaims(
          cognitoTokensResponse.id_token
        );

        newJwtData = {
          ...newJwtData,
          ...cognitoTokensResponse,
          ...idTokenClaims,
        };
      }

      return newJwtData;
    },
    session(sessionData) {
      const { session, token } = sessionData;
      session.user.id = token.id as string;
      return { ...session, ...token };
    },
    authorized: async (authorizedData) => {
      const { auth } = authorizedData;
      return !!auth;
    },
  },
  pages: {
    signIn: "/api/signin",
  },
});

export interface CognitoTokenResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  expires_at?: number;
}

export async function refreshCognitoToken(
  refreshToken: string
): Promise<CognitoTokenResponse> {
  const clientId = process.env.AUTH_COGNITO_ID!;
  const clientSecret = process.env.AUTH_COGNITO_SECRET!;
  const tokenEndpoint = `${process.env.COGNITO_DOMAIN}/oauth2/token`; // e.g. https://your-domain.auth.us-east-1.amazoncognito.com/oauth2/token

  console.log("Refreshing Cognito token...", clientId, tokenEndpoint);
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to refresh Cognito token: ${response.status} ${errorText}`
    );
  }

  const tokens = (await response.json()) as CognitoTokenResponse;
  tokens.expires_at = Math.floor(Date.now() / 1000) + tokens.expires_in;

  return tokens;
}

// export interface CognitoIdTokenClaims {
//   "custom:userId"?: string;
//   "custom:publisherId"?: string;
//   "custom:customerId"?: string;
//   "cognito:groups"?: string[];
// }

export function decodeIdTokenClaims(idToken: string): Record<string, any> {
  const parts = idToken.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid ID token format");
  }

  const payload = parts[1];
  const decoded = Buffer.from(payload, "base64url").toString("utf8");
  const claims = JSON.parse(decoded) as Record<string, any>;

  return claims;
}
