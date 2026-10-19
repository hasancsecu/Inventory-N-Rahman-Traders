import { getActiveAgency, getAllAgencies } from "@/actions/agency";
import { getStoredProducts, getStoredSuppliers } from "@/lib/backend-store";
import { getCurrentUser } from "@/lib/auth";
import { InventoryClient } from "./inventory-client";

export default async function InventoryPage() {
  const currentAgency = await getActiveAgency();
  const agencies = await getAllAgencies();
  const currentUser = await getCurrentUser();

  const products = currentAgency ? getStoredProducts(currentAgency.id) : getStoredProducts();
  const suppliers = currentAgency ? getStoredSuppliers(currentAgency.id) : getStoredSuppliers();

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
