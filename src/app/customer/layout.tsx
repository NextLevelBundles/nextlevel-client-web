import Link from "next/link";
import { MainNav } from "./components/main-nav";
import { TopNav } from "./components/top-nav";
import { getServerSession } from "@/lib/auth/server-auth";
import Logo from "../(shared)/components/logo";

export default async function CustomerNavigation({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  
  // Session check happens in middleware, but we check for expired tokens here
  if (session && "expired" in session) {
    // This shouldn't happen as middleware should catch it, but just in case
    return null;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="fixed hidden h-screen w-64 flex-col gap-6 border-r bg-white dark:bg-[#0f111a] shadow-lg backdrop-blur-xs dark:bg-opacity-80 p-6 lg:flex overflow-y-auto">
        <Link
          href="/"
          className="flex items-center gap-2 pl-3 hover:opacity-80 transition-all"
        >
          <div className="mb-3">
            <Logo width={160} height={0} />
          </div>
        </Link>
        <MainNav />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-[#0f111a] lg:ml-64">
        <TopNav user={session?.user} />
        <div className="container mx-auto p-6 pt-20 lg:pt-6">{children}</div>
      </div>
    </div>
  );
}
