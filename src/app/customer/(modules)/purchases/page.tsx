import { PurchaseHistory } from "@/customer/components/purchases/purchase-history";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function PurchasesPage() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Purchase History</h1>
      </div>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <PurchaseHistory />
      </Suspense>
    </div>
  );
}
