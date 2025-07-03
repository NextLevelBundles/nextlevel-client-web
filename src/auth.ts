import Cognito from "next-auth/providers/cognito";
import NextAuth from "next-auth";
import { cookies } from "next/headers";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Cognito({
      authorization: {
        params: {
          scope: "aws.cognito.signin.user.admin email openid phone profile",
        },
      },
      profile(profile) {
        console.log("Cognito profile:", profile);
        return profile;
      },
    }),
  ],
  session: {
    strategy: 'jwt',  // <-- make sure to use jwt here
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return {...token, ...user };
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      return { ...session, ...token }
    },
    authorized: async ({ auth }) => {
      return !!auth;
    },
  },
  pages: {
    signIn: "/api/signin",
  },
});

export async function getAccessToken() {
  const sessionTokenName = 'authjs.session-token'; // or 'next-auth.session-token' if using next-auth
  const sessionToken = (await cookies()).getAll().find(c => c.name.includes(sessionTokenName));
 
  console.log("Session token found:", sessionToken);

  // console.log("Decoded token:", sessionToken?.value);
}