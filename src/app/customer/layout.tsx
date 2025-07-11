import { MenuIcon } from "lucide-react";
import {
  SheetTrigger,
  SheetContent,
  Sheet,
} from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import { MainNav } from "./components/main-nav";
import { TopNav } from "./components/top-nav";
import requireOnboarding from "@/shared/utils/onboarding";
import Image from "next/image";
import { auth } from "@/auth";

export default async function CustomerNavigation({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOnboarding();

  const session = await auth();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="fixed hidden h-screen w-64 flex-col gap-6 border-r bg-white dark:bg-[#0f111a] shadow-lg backdrop-blur-xs dark:bg-opacity-80 p-6 lg:flex overflow-y-auto">
        <Link
          href="/"
          className="flex items-center gap-2 pl-3 hover:opacity-80 transition-all"
        >
          <div className="mb-3">
            <Image
              src="/logo/digiphile-logo-rectangle.png"
              alt="Digiphile Logo"
              width="160"
              height="0"
            />
          </div>
        </Link>
        <MainNav />
      </div>

      {/* Mobile header */}
      <div className="fixed top-0 z-50 flex w-full items-center justify-between border-b bg-white dark:bg-[#1a1d2e]/80 backdrop-blur-xs shadow-xs p-4 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="">
            <Image
              src="/logo/digiphile-logo-rectangle.png"
              alt="Digiphile Logo"
              width="160"
              height="0"
            />
          </div>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <MenuIcon className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-6">
            <MainNav />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-[#0f111a] lg:ml-64">
        <TopNav session={session} />
        <div className="container mx-auto p-6 pt-20 lg:pt-6">{children}</div>
      </div>
    </div>
  );
}
