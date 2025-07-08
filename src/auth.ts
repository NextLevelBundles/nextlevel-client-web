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
    jwt(jwtData) {
      const { token, user, account } = jwtData;
      return { ...token, ...user, ...account };
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
