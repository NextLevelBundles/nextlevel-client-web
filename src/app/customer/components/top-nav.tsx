"use client";

import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
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
  TrophyIcon,
  MessageCircleIcon,
  SearchIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { useSession } from "next-auth/react";
import SignOutButton from "@/app/(home)/components/SignOutButton";
import { Input } from "@/app/(shared)/components/ui/input";
import { ThemeToggle } from "@/app/(shared)/components/theme-toggle";

export function TopNav() {
  const xpProgress = 50; // Replace with actual XP progress

  const session = useSession();

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
          {/* Badge Status */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/badges">
                  <div className="hidden sm:flex items-center gap-2 rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-[#202430] dark:hover:bg-[#273043] px-3 py-1.5 transition-colors cursor-pointer">
                    <TrophyIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Level 5</span>
                    <div className="w-16">
                      <Progress value={xpProgress} className="h-1" />
                    </div>
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Game Enthusiast • 500/1000 XP</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="h-6 w-px bg-border hidden sm:block" />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full hover:opacity-85 ring shadow-xs ring-foreground/20 dark:ring-foreground  transition-colors"
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
                  <p className="text-sm font-medium leading-none">
                    {session.data?.user?.name ?? "Unknown user"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.data?.user?.email}
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
              <DropdownMenuItem className="rounded-md px-2 py-1.5 transition-colors duration-150 hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary focus:bg-primary/5 focus:text-primary dark:focus:bg-primary/10 dark:focus:text-primary">
                <SettingsIcon className="mr-2 h-4 w-4" />
                <Link href="settings" className="flex-1">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="rounded-md px-2 py-1.5 transition-colors duration-150 hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary focus:bg-primary/5 focus:text-primary dark:focus:bg-primary/10 dark:focus:text-primary"
              >
                <Link href="support" className="flex items-center">
                  <MessageCircleIcon className="mr-2 h-4 w-4" />
                  <span className="flex-1">Support</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                asChild
                className="text-destructive rounded-md px-2 py-1.5 transition-colors duration-150 hover:bg-destructive/5 hover:text-destructive dark:hover:bg-destructive/10 dark:hover:text-destructive focus:bg-destructive/5 focus:text-destructive dark:focus:bg-destructive/10 dark:focus:text-destructive"
              >
                <div>
                  <SignOutButton />
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
