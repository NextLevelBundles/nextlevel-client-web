"use client";

import { Button } from "@/app/(shared)/components/ui/button";
import Link from "next/link";

export default function SignUpButton() {
  return (
    <Link
      href={
        "https://auth.nextlevelbundle.com/signup?response_type=code&client_id=2nrhrl7qnj55s275u2jd0ks9a1&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fcognito&scope=openid+email+phone&code_challenge=Naq-tRpO-rVBS3sNbGTaUyg_zmebJdlwJEahSera2O0&code_challenge_method=S256"
      }
    >
      <Button className="bg-primary text-white hover:bg-primary/90">
        Sign Up
      </Button>
    </Link>
  );
}
