import { PackageIcon, KeyIcon, HeartIcon } from "lucide-react";
import { QuickActions } from "../../components/dashboard/quick-actions";
import { RecentBundles } from "../../components/dashboard/recent-bundles";
import { StatsCard } from "../../components/dashboard/stats-card";
import { SteamStatus } from "../../components/dashboard/steam-status";

export default function Home() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Hey GamerTag123, welcome back! 👋
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Bundles"
          value="12"
          icon={<PackageIcon className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Keys Revealed"
          value="47"
          icon={<KeyIcon className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Donated to Charity"
          value="$142.50"
          icon={<HeartIcon className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SteamStatus />
        <QuickActions />
      </div>

      <RecentBundles />
    </div>
  );
}
