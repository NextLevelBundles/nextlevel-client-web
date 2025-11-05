"use client";

import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  SettingsIcon,
  MessageCircleIcon,
  SearchIcon,
  User,
} from "lucide-react";
import SignOutButton from "@/app/(home)/components/SignOutButton";
import { Input } from "@/app/(shared)/components/ui/input";
import { ThemeToggle } from "@/app/(shared)/components/theme-toggle";
import { UserCredits } from "@/app/(shared)/components/user-credits";

interface TopNavProps {
  user?: { email?: string; name?: string } | null;
}
export function TopNav({ user }: TopNavProps) {
  return (
    <div className="sticky top-0 z-50 w-full border-b bg-white dark:bg-[#1a1d2e]/80 backdrop-blur-xs shadow-xs transition-all">
      <div className="flex h-14 md:h-16 items-center gap-4 px-4">
        {/* Search Bar */}
        <div className="flex-1 md:max-w-md">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search games, bundles..."
              className="w-full pl-9 focus:ring-2 ring-primary/20"
            />
          </div>
        </div>

        {/* Center Section */}
        {/* <div className="hidden md:flex items-center">
          <div className="flex h-16 items-center justify-between">
            <div className="hidden md:flex md:items-center md:gap-8">
              <a
                href="/bundles"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Bundles
              </a>
            </div>
          </div>
        </div> */}

        {/* Right Section */}
        <div className="ml-auto flex items-center gap-2 md:gap-4">
          {/* User Credits */}
          <div className="hidden sm:block">
            <UserCredits variant="default" />
          </div>

          <div className="h-6 w-px bg-border hidden sm:block" />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full hover:opacity-85 ring shadow-xs ring-foreground/20 dark:ring-foreground  transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56"
              align="end"
              forceMount
              sideOffset={8}
              alignOffset={0}
              side="bottom"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  {user?.name && (
                    <p className="text-sm font-medium leading-none">
                      {user?.name}
                    </p>
                  )}

                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem className="rounded-md px-2 py-1.5 transition-colors duration-150 hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary focus:bg-primary/5 focus:text-primary dark:focus:bg-primary/10 dark:focus:text-primary">
                      <UserIcon className="mr-2 h-4 w-4" />
                      <Link href="profile" className="flex-1">
                        Profile
                      </Link>
                    </DropdownMenuItem> */}
              <DropdownMenuItem
                asChild
                className="cursor-pointer rounded-md px-2 py-1.5 transition-colors duration-150 hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary focus:bg-primary/5 focus:text-primary dark:focus:bg-primary/10 dark:focus:text-primary"
              >
                <Link href="/customer/settings" className="flex items-center cursor-pointer">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span className="flex-1">Settings</span>
                </Link>
              </DropdownMenuItem>
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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                asChild
                className="cursor-pointer text-destructive rounded-md px-2 py-1.5 transition-colors duration-150 hover:bg-destructive/5 hover:text-destructive dark:hover:bg-destructive/10 dark:hover:text-destructive focus:bg-destructive/5 focus:text-destructive dark:focus:bg-destructive/10 dark:focus:text-destructive"
              >
                <div className="cursor-pointer">
                  <SignOutButton variant="dropdown" />
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
