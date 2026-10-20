import { redirect } from "next/navigation";
import { getActiveAgency, getAllAgencies } from "@/actions/agency";
import { getDashboardAnalytics } from "@/actions/analytics";
import { getCurrentUser } from "@/lib/auth";
import { getDbProducts, getDbInvoices } from "@/lib/db-service";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }

  const currentAgency = await getActiveAgency();
  const agencies = await getAllAgencies();
  const analytics = await getDashboardAnalytics(currentAgency?.id);

  const activeProducts = await getDbProducts(currentAgency?.id);
  const recentInvoices = (await getDbInvoices(currentAgency?.id)).slice(0, 8);

  const lowStockBatches = activeProducts.flatMap((p) =>
    (p.batches || []).filter(
      (b: any) => b.stockQuantity <= (b.minAlertStock || 5),
    ),
  );

  const totalStockUnits = activeProducts.reduce(
    (sum, p) =>
      sum + (p.batches?.reduce((bSum, b) => bSum + b.stockQuantity, 0) || 0),
    0,
  );

  const totalBatchesCount = activeProducts.reduce(
    (sum, p) => sum + (p.batches?.length || 0),
    0,
  );

  return (
    <DashboardClient
      currentUser={currentUser}
      currentAgency={currentAgency}
      agencies={agencies}
      analytics={analytics}
      recentInvoices={recentInvoices}
      totalStockUnits={totalStockUnits}
      totalBatchesCount={totalBatchesCount}
      lowStockBatches={lowStockBatches}
    />
  );
}
