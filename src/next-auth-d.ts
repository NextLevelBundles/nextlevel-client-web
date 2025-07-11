// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { JWT } from "next-auth/jwt";
import { DefaultSession } from "next-auth";

declare module "next-auth/jwt" {
  interface JWT {
    idToken?: string;
    accessToken?: string;
    refresh_token?: string;
    expires_at?: number;
  }
}

declare module "next-auth" {
  interface Session {
    id_token?: string;
    refresh_token?: string;
    access_token?: string;
    "cognito:groups"?: string[];
    "cognito:username"?: string;
    "custom:publisherId"?: string;
    "custom:userId"?: string;
    "custom:customerId"?: string;
    name?: string;
    email?: string;
    user: {} & DefaultSession["user"];
  }
}
