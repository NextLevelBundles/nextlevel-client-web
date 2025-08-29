import { BellIcon } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border bg-card/30 p-8 text-center">
      <div className="mb-4 rounded-full bg-primary/10 p-3">
        <BellIcon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="mb-2 text-xl font-semibold">Notification Settings</h3>
      <p className="text-sm text-muted-foreground max-w-md">
        Notification preferences will be available here soon.
      </p>
    </div>
  );
}
