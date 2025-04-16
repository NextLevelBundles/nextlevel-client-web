"use client";

import { LogOutIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  const onSignOut = async () => {
    const data = await signOut({ redirect: false, callbackUrl: "/" });
    router.push(data.url);
  };

  return (
    <button
      onClick={onSignOut}
      type="button"
      className="flex items-center gap-2 text-sm font-medium text-destructive"
    >
      <LogOutIcon className="h-4 w-4" />
      <span>Log out</span>
    </button>
  );
}
