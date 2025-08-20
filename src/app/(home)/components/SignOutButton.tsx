"use client";

import { LogOutIcon } from "lucide-react";
import { useAuth } from "@/app/(shared)/providers/auth-provider";

export default function SignOutButton() {
  const { signOut } = useAuth();

  const onSignOut = async () => {
    await signOut();
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
