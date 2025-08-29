"use client";

import { Button } from "@/app/(shared)/components/ui/button";
import { useRouter } from "next/navigation";

export default function SignInButton() {
  const router = useRouter();

  const onSignIn = () => {
    router.push("/auth/signin");
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
