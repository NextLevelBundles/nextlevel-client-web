// app/page.tsx
"use client";

import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";

export default function AuthLogin() {
  const { data: session } = useSession();
  //   const session = await getServerSession(authOptions);
  console.log("client session", session);
  return (
    <SessionProvider session={session}>
      <main>
        <h1>NextAuth + Cognito Example</h1>
        {session ? (
          <>
            <p>Signed in as {session.user?.email}</p>
            <button onClick={() => signOut()}>Sign out</button>
          </>
        ) : (
          <button onClick={() => signIn("cognito")}>
            Sign in with Cognito
          </button>
        )}
      </main>
    </SessionProvider>
  );
}
