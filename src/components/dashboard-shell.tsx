import { GamepadIcon, MenuIcon } from 'lucide-react';
import { MainNav } from '@/components/main-nav';
import { TopNav } from '@/components/top-nav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="fixed hidden h-screen w-64 flex-col gap-6 border-r bg-white dark:bg-[#0f111a] shadow-lg backdrop-blur-xs dark:bg-opacity-80 p-6 lg:flex overflow-y-auto">
        <div className="flex items-center gap-2 px-3">
          <GamepadIcon className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">GameBundle</span>
        </div>
        <MainNav />
      </div>

      {/* Mobile header */}
      <div className="fixed top-0 z-50 flex w-full items-center justify-between border-b bg-white dark:bg-[#1a1d2e]/80 backdrop-blur-xs shadow-xs p-4 lg:hidden">
        <div className="flex items-center gap-2">
          <GamepadIcon className="h-6 w-6 text-primary" />
          <span className="font-bold">GameBundle</span>
        </div>
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
        <TopNav />
        <div className="container mx-auto p-6 pt-20 lg:pt-6">{children}</div>
      </div>
    </div>
  );
}