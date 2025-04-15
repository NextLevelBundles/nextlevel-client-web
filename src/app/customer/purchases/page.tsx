import { DashboardShell } from '@/components/dashboard-shell';
import { PurchaseHistory } from '@/components/purchases/purchase-history';

export default function PurchasesPage() {
  return (
    <DashboardShell>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Purchase History</h1>
        </div>
        <PurchaseHistory />
      </div>
    </DashboardShell>
  );
}