import { Button } from "@/app/(shared)/components/ui/button";
import Link from "next/link";

export default function SignUpButton() {
  return (
    <Link href="/auth/signup">
      <Button className="bg-primary text-white hover:bg-primary/90">
        Sign Up
      </Button>
    </Link>
  );
}
