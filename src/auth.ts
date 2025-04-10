import { AuthOptions, getServerSession } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

// https://medium.com/@rody.gosset/setting-up-nextauth-js-in-a-next-js-14-app-router-project-ec3252dc2780
const authOptions: AuthOptions = {
  providers: [
    CognitoProvider({
      clientId: "2nrhrl7qnj55s275u2jd0ks9a1",
      clientSecret: "14lbnl7bqb0lsop0t7hciget4p9cdn266a352mifcsga69bd258i",
      issuer: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_7M0NmzbcR",
    }),
  ],
  secret: "your-nextauth-secret",
  callbacks: {
    async jwt({ token, account }) {
      console.log("jwt", token, account);
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("session", session, token);

      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      return session;
    },
  },
  //   pages: {
  //     //   signIn: "/auth/signin", // Optional: custom sign-in page
  //   },
};

const getSession = () => getServerSession(authOptions);
export { authOptions, getSession };
