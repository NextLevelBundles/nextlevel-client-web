"use client";

import { Button } from "@/app/(shared)/components/ui/button";
import { signIn } from "next-auth/react";

export default function SignInButton() {
  const onSignIn = async () => {
    await signIn("cognito");
  };

  return (
    <Button
      onClick={onSignIn}
      variant="ghost"
      className="hover:text-primary transition-colors"
    >
      Login
    </Button>
  );
}
