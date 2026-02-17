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
import { Settings, MessageCircleIcon, GamepadIcon, User, UserIcon, StarIcon } from "lucide-react";
import Link from "next/link";
import SignInButton from "./SignInButton";
import SignUpButton from "./SignUpButton";
import SignOutButton from "./SignOutButton";
import { useAuth } from "@/app/(shared)/providers/auth-provider";
import { useCustomer } from "@/hooks/queries/useCustomer";
import { useCustomerProfileByHandle } from "@/hooks/queries/useCustomerProfile";

export function UserProfile() {
  const { user, isLoading } = useAuth();
  const { data: customer } = useCustomer();
  const { data: customerProfile } = useCustomerProfileByHandle(customer?.handle ?? "");

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <SignInButton />
        <SignUpButton />
      </div>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 ml-4 rounded-full hover:opacity-85 ring shadow-xs ring-foreground/5 dark:ring-ring transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            {user?.name && (
              <p className="text-sm font-medium leading-none">{user.name}</p>
            )}

            {user?.email && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-md px-2 py-1.5 transition-colors duration-150 hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary focus:bg-primary/5 focus:text-primary dark:focus:bg-primary/10 dark:focus:text-primary"
          >
            <Link href="/customer/dashboard" className="flex items-center cursor-pointer">
              <GamepadIcon className="mr-2 h-4 w-4" />
              <span className="flex-1">Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-md px-2 py-1.5 transition-colors duration-150 hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary focus:bg-primary/5 focus:text-primary dark:focus:bg-primary/10 dark:focus:text-primary"
          >
            <Link href={`/community/profiles/${customer?.handle ?? ""}`} className="flex items-center cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" />
              <span className="flex-1">Profile</span>
            </Link>
          </DropdownMenuItem>
          {customerProfile?.isCurator && (
            <DropdownMenuItem
              asChild
              className="cursor-pointer rounded-md px-2 py-1.5 transition-colors duration-150 hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary focus:bg-primary/5 focus:text-primary dark:focus:bg-primary/10 dark:focus:text-primary"
            >
              <Link href={`/community/curators/${customer?.handle ?? ""}`} className="flex items-center cursor-pointer">
                <StarIcon className="mr-2 h-4 w-4" />
                <span className="flex-1">Curator Profile</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-md px-2 py-1.5 transition-colors duration-150 hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary focus:bg-primary/5 focus:text-primary dark:focus:bg-primary/10 dark:focus:text-primary"
          >
            <Link href="/customer/settings" className="flex items-center cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span className="flex-1">Settings</span>
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
            className="cursor-pointer rounded-md px-2 py-1.5 transition-colors duration-150 hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary focus:bg-primary/5 focus:text-primary dark:focus:bg-primary/10 dark:focus:text-primary"
          >
            <a
              href="https://sites.google.com/digiphile.co/help"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center cursor-pointer"
            >
              <MessageCircleIcon className="mr-2 h-4 w-4" />
              <span className="flex-1">Support</span>
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400">
          <SignOutButton variant="dropdown" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
