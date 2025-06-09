import Cognito from "next-auth/providers/cognito";

import NextAuth from "next-auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Cognito({
      authorization: {
        params: {
          scope: "openid email phone",
        },
      },
      profile(profile) {
        return profile;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // token.accessToken = user.access_token;
        // token.idToken = user.id_token;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      // session.accessToken = token.accessToken;
      // session.idToken = token.idToken;
      return session;
    },
    authorized: async ({ auth }) => {
      return !!auth;
    },
  },
  pages: {
    signIn: "/api/signin",
  },
});

// declare module "next-auth" {
//   /**
//    * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
//    */
//   interface Session {
//     user: {
//       /**
//        * By default, TypeScript merges new interface properties and overwrites existing ones.
//        * In this case, the default session user properties will be overwritten,
//        * with the new ones defined above. To keep the default session user properties,
//        * you need to add them back into the newly declared interface.
//        */
//     } & DefaultSession["user"];
//   }
// }
