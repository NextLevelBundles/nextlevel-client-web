"use client";

import { Button } from "@/app/(shared)/components/ui/button";
import { useRouter } from "next/navigation";

export default function SignInButton() {
  const router = useRouter();

  const onSignIn = () => {
    const signInUrl = new URL("/auth/signin", window.location.origin);
    signInUrl.searchParams.set("callbackUrl", window.location.pathname);
    router.push(signInUrl.toString());
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
