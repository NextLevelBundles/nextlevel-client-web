import { Button } from "@/app/(shared)/components/ui/button";
import Link from "next/link";

export default function SignUpButton() {
  const signupLink = `${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/signup?response_type=code&client_id=${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI}&scope=openid+email+phone+profile`;
  return (
    <Link href={signupLink}>
      <Button className="bg-primary text-white hover:bg-primary/90">
        Sign Up
      </Button>
    </Link>
  );
}
