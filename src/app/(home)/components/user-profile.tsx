"use client";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Settings, LogOut, MessageCircleIcon, GamepadIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import SignInButton from "./SignInButton";
import SignUpButton from "./SignUpButton";

export function UserProfile() {
  const session = useSession();

  if (session.status === "unauthenticated") {
    return (
      <div className="flex items-center gap-2">
        <SignInButton />
        <SignUpButton />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full hover:opacity-85 ring shadow-xs ring-foreground/5 dark:ring-ring transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&auto=format&fit=crop"
              alt="@user"
            />
            <AvatarFallback>GT</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.data?.user?.name ?? "Unknown user"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.data?.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            asChild
            className="rounded-md px-2 py-1.5 transition-colors duration-150 hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary focus:bg-primary/5 focus:text-primary dark:focus:bg-primary/10 dark:focus:text-primary"
          >
            <Link href="customer/dashboard" className="flex items-center">
              <GamepadIcon className="mr-2 h-4 w-4" />
              <span className="flex-1">Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-md px-2 py-1.5 transition-colors duration-150 hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary focus:bg-primary/5 focus:text-primary dark:focus:bg-primary/10 dark:focus:text-primary">
            <Settings className="mr-2 h-4 w-4" />
            <Link href="customer/settings" className="flex-1">
              Settings
            </Link>
          </DropdownMenuItem>
          {/* <DropdownMenuItem
            asChild
            className="rounded-md px-2 py-1.5 transition-colors duration-150 hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary focus:bg-primary/5 focus:text-primary dark:focus:bg-primary/10 dark:focus:text-primary"
          >
            <Link href="customer/dashboard" className="flex items-center">
              <KeyIcon className="mr-2 h-4 w-4" />
              <span className="flex-1">My Keys</span>
            </Link>
          </DropdownMenuItem> */}
          <DropdownMenuItem
            asChild
            className="rounded-md px-2 py-1.5 transition-colors duration-150 hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary focus:bg-primary/5 focus:text-primary dark:focus:bg-primary/10 dark:focus:text-primary"
          >
            <Link href="customer/support" className="flex items-center">
              <MessageCircleIcon className="mr-2 h-4 w-4" />
              <span className="flex-1">Support</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600 dark:text-red-400">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
