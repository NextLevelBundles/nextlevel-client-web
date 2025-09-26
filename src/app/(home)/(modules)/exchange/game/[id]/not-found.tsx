import { Button } from "@/shared/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Navigation } from "@/home/components/navigation";
import { Footer } from "@/home/components/sections/footer";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Game not found</h2>
          <p className="text-muted-foreground">The game you're looking for doesn't exist or has been removed.</p>
          <Link href="/exchange">
            <Button>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Exchange
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}