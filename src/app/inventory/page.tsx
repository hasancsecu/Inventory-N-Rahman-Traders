import { redirect } from "next/navigation";
import { getActiveAgency, getAllAgencies } from "@/actions/agency";
import { getDbProducts, getDbSuppliers } from "@/lib/db-service";
import { getCurrentUser } from "@/lib/auth";
import { InventoryClient } from "./inventory-client";

export default async function InventoryPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }

  const currentAgency = await getActiveAgency();
  const agencies = await getAllAgencies();
  const products = await getDbProducts(currentAgency?.id);
  const suppliers = await getDbSuppliers(currentAgency?.id);

  return (
    <div className="flex-1 max-w-[90rem] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <InventoryClient
        currentAgency={currentAgency}
        agencies={agencies}
        products={products}
        suppliers={suppliers}
        currentUser={currentUser}
      />
    </div>
  );
}
