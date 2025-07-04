import { JWT } from "next-auth/jwt";
import { DefaultSession } from "next-auth";

declare module "next-auth/jwt" {
  interface JWT {
    idToken?: string;
    accessToken?: string;
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
    user: {
    } & DefaultSession["user"];
  }
}