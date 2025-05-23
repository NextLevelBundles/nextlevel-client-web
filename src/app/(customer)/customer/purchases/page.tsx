import { PurchaseHistory } from "@/customer/components/purchases/purchase-history";

export default function PurchasesPage() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Purchase History</h1>
      </div>
      <PurchaseHistory />
    </div>
  );
}
